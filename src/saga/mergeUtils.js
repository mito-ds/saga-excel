import { conflictType } from "../constants";
import { numToChar } from "./sagaUtils";

// This makes it so we can "square everything up..."
export class ValueWrapper {
    constructor(values) {
        this.values = values;
    }

    getCell(row, col) {
        return this.values[row] ? (this.values[row][col] ? this.values[row][col] : "") : "";
    }
}

/*
    This does a simple cell-address based merge. It doesn't handle inserts/deletions of rows, 
    but it is very simple, and very fast. 

    It returns an object with two keys: "result", "conflicts". "result" is the best attempt
    merge, and "conflicts" is a list of objects that represent merge conflicts.

    These merge conflict objects contain five keys: "conflictType", "rowIndex", "colIndex", "a", "b". 
    If "conflictType" is conflictType.ROW, then there was a row insertion conflict, and "colIndex" will be null.
    Otherwise, if it is conflictType.CELL, both "rowIndex" and "colIndex" will be defined.

    In both cases, "a" and "b" each contain the two options for the conflict.

*/
export function simpleMerge2D(origin, aValues, bValues, sheetName) {

    const maxNumRows = Math.max(origin.length, aValues.length, bValues.length);
    const maxNumCols = Math.max(origin[0] ? origin[0].length : 0, aValues[0] ? aValues[0].length : 0, bValues[0] ? bValues[0].length : 0);

    const oValueWrapper = new ValueWrapper(origin);
    const aValueWrapper = new ValueWrapper(aValues);
    const bValueWrapper = new ValueWrapper(bValues);


    const result = [];
    const conflicts = [];
    for (let i = 0; i < maxNumRows; i++) {
        let row = [];
        for (let j = 0; j < maxNumCols; j++) {
            const oElement = oValueWrapper.getCell(i, j);
            const aElement = aValueWrapper.getCell(i, j);
            const bElement = bValueWrapper.getCell(i, j);

            if (aElement === bElement) {
                row.push(aElement);
            } else if (oElement === aElement) {
                row.push(bElement);
            } else if (oElement === bElement) {
                row.push(aElement);
            } else {
                const columnName = numToChar(j + 1);
                const excelRow = i + 1;
                const cell = columnName + excelRow;

                // We arbitrarily choose a as the result
                row.push(aElement);

                conflicts.push({
                    conflictType: conflictType.CELL,
                    sheet: sheetName,
                    cellOrRow: cell,
                    a: aElement,
                    b: bElement,
                    o: oElement
                });
            }
        }
        result.push(row);
    }

    return {sheet: sheetName, result: result, conflicts: conflicts};
}
