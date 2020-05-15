import { conflictType } from "../constants";

function checkEmpty(row) {
    const filteredRow = row.filter(element => element != "");
    return filteredRow.length == 0 
}

function handleOriginUndefinedRow(a, b, possibleConflictType, rowIndex, colIndex) {
    if (a === undefined || checkEmpty(a)) {
        return {result: b, conflicts: []};
    }

    if (b == undefined || checkEmpty(b)) {
        return {result: a, conflicts: []};
    }

    return createOriginUndefinedConflict(a, b, possibleConflictType, rowIndex, colIndex)
}

function handleOriginUndefinedElement(a, b, possibleConflictType, rowIndex, colIndex) {

    if (a === undefined) {
        return {result: b, conflicts: []};
    }

    if (b === undefined) {
        return {result: a, conflicts: []};
    }

    return createOriginUndefinedConflict(a, b, possibleConflictType, rowIndex, colIndex)
}

/*
 Returns a conflict which occurs when both a and b were editted with an undefined origin. 
 Arbitrarily choose a as the result
*/
function createOriginUndefinedConflict(a, b, possibleConflictType, rowIndex, colIndex) {
    return {
        result: a, 
        conflicts: [
            {
                conflictType: possibleConflictType,
                rowIndex: rowIndex,
                colIndex: colIndex,
                a: a,
                b: b
            }
        ]
    }
}

/*
    This does a simple cell-address based merge. It just handles one row at a time.
*/
function simpleMerge(oRow, aRow, bRow, rowIndex) {

    /*
        If the origin row is undefined, then we can take aRow or bRow if only one of them
        was inserted.
    */
    if (oRow === undefined) {
        return handleOriginUndefinedRow(aRow, bRow, conflictType.ROW, rowIndex, null);
    } else {
        // This is the case where the origin is defined, so we can do more intelligent merging

        const maxLength = Math.max(oRow.length, aRow.length, bRow.length);

        var row = [];
        var conflicts = [];

        for (let i = 0; i < maxLength; i++) {
            const oElement = oRow[i];
            const aElement = aRow[i];
            const bElement = bRow[i];

            if (oElement === undefined) {
                const cellMergeResult = handleOriginUndefinedElement(aElement, bElement, conflictType.CELL, rowIndex, i);

                row.push(cellMergeResult.result);
                conflicts.push(...cellMergeResult.conflicts);
            } else {
                // No changes were made
                if (oElement === aElement && oElement === bElement) {
                    row.push(oElement);
                }

                // Only a was changed
                if (oElement !== aElement && aElement === bElement) {
                    row.push(aElement);
                }

                // Only b was changed
                if (oElement === aElement && aElement !== bElement) {
                    row.push(bElement);
                }

                // Both were changed, we have a conflict
                if (oElement !== aElement && aElement !== bElement) {
                    // We arbitrarily choose to take the aElement
                    row.push(aElement);
                    conflicts.push({
                        conflictType: conflictType.CELL,
                        rowIndex: rowIndex, 
                        colIndex: i,
                        a: aElement,
                        b: bElement
                    })
                }
            }            
        }
        return {result: row, conflicts: conflicts};
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
export function simpleMerge2D(origin, aValues, bValues) {

    const maxLength = Math.max(origin.length, aValues.length, bValues.length);

    var result = [];
    var conflicts = [];

    for (let i = 0; i < maxLength; i++) {
        const oRow = origin[i];
        const aRow = aValues[i];
        const bRow = bValues[i];

        const rowMerge = simpleMerge(oRow, aRow, bRow, i);

        result.push(rowMerge.result);
        conflicts.push(...rowMerge.conflicts);
    }

    return {result: result, conflicts: conflicts};
}
