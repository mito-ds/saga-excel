
import {  numToChar } from "./sagaUtils";

function rowDiff (initialRow, finalRow, sheetName, rowIndex) {
    let changes = []
    const maxLength = Math.max(initialRow.length, finalRow.length);
    for (var i = 0; i < maxLength; i++) {
        var initialElement = initialRow[i];
        var finalElement = finalRow[i];

        if (initialElement === undefined) {
            initialElement = ""
        }

        if (finalElement === undefined) {
            finalElement = ""
        }
        
        if (initialElement !== finalElement) {
            const columnName = numToChar(i + 1);
            const excelRow = rowIndex;
            const cell = columnName + excelRow;

            changes.push({
                sheet: sheetName,
                cell: cell,
                initalElement: initialElement, 
                finalElement: finalElement
            });
        }
    }
    return changes
}


export async function simpleDiff2D(context, initialValue, finalValues, sheetName) {
    const maxLength = Math.max(initialValue.length, finalValues.length);

    var changes = [];

    for (let i = 0; i < maxLength; i++) {
        const initalRow = initialValue[i];
        const finalRow = finalValues[i];

        console.log("detecting differences in", initalRow, finalRow);

        const differences = rowDiff(initalRow, finalRow);
        changes.push(...differences);
    }

    return {sheet: sheetName, changes: changes};
}



//export async function diff(context, initialCommit, finalCommit) {
    /*
    - create a project
    - get sheets from each commit 
    - iterate through commitEnd sheets 
    - get similar named commitStart sheet, send to diff2D
    - compile results

    TODO: Handle the case where a sheet is renamed. check if event handle exists
    */
/*
    const project = new Project(context);

    // Get sheets on commits
    
    const sheets = await project.getSheetsWithNames();
    const initialCommitSheets = getCommitSheets(sheets, initialCommit);
    const finalCommitSheets = getCommitSheets(sheets, finalCommit);

    const initialCommitPrefix = `saga-${initialCommit}-`;
    const finalCommitPrefix = `saga-${finalCommit}-`;

    // Calculate the diff between the sheets


}



export async function runDiff(initialCommit, finalCommit) {
    return runOperation(diff, initialCommit, finalCommit);
}
*/