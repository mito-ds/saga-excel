import { runOperation } from './runOperation';
import { getCommitSheets, getFormulas, numToChar } from "./sagaUtils";
import Project from "./Project";
import { getSheetNamePairs, removePrefix, findInsertedSheets, findDeletedSheets, findModifiedSheets } from "./diffUtils";
import { changeType } from '../constants'


// handle diff detection when a row does not exist on one of the sheets
function handleUndefinedRow(row, sheetName, rowIndex, isInitial) {
    let changes = []

    for (var i = 0; i < row.length; i++) {
        const element = row[i]

        if (element !== "") {
            const columnName = numToChar(i + 1);
            const excelRow = rowIndex + 1;
            const cell = columnName + excelRow;

            if (isInitial) {
                changes.push({
                    sheet: sheetName,
                    cell: cell,
                    initalElement: element, 
                    finalElement: ""
                });
            } else {
                changes.push({
                    sheet: sheetName,
                    cell: cell,
                    initalElement: "", 
                    finalElement: element
                });
            }   
        }
    }
    return changes
}

// Find all of the differences between two lists
function rowDiff (initialRow, finalRow, sheetName, rowIndex) {
    let changes = []

    // if neither row exists, return
    if (initialRow === undefined && finalRow === undefined) {
        return changes
    }

    // if only one row exists
    if (initialRow === undefined || finalRow === undefined) {
        return initialRow === undefined ? handleUndefinedRow(finalRow, sheetName, rowIndex, false) : handleUndefinedRow(initialRow, sheetName, rowIndex, true)
    }

    // iterate through the rows to find changes
    const maxLength = Math.max(initialRow.length, finalRow.length);
    for (var i = 0; i < maxLength; i++) {
        var initialElement = initialRow[i];
        var finalElement = finalRow[i];

        // handle if the element is undefined
        if (initialElement === undefined) {
            initialElement = ""
        }

        if (finalElement === undefined) {
            finalElement = ""
        }
        
        // if the element changed, capture the change
        if (initialElement !== finalElement) {
            const columnName = numToChar(i + 1);
            const excelRow = rowIndex + 1;
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

// find all of the changes between two 2D array representations of a sheets
export function simpleDiff2D(initialValue, finalValues, sheetName) {
    const maxLength = Math.max(initialValue.length, finalValues.length);

    var changes = [];

    for (let i = 0; i < maxLength; i++) {
        const initalRow = initialValue[i];
        const finalRow = finalValues[i];

        console.log("detecting differences in", initalRow, finalRow);

        const differences = rowDiff(initalRow, finalRow, sheetName, i);
        changes.push(...differences);
    }
    console.log(changes)

    return {sheet: sheetName, changeType: changeType.MODIFIED, changes: changes}
}

async function diff(context, initialCommit, finalCommit) {
    /*
    - create a project
    - get sheets from each commit 
    - iterate through commitEnd sheets 
    - get similar named commitStart sheet, send to diff2D
    - compile results

    TODO: Handle the case where a sheet is renamed. check if event handle exists
    TODO: Maintain some sheet ordering
    */
    const project = new Project(context);

    // Get sheets on commits
    const sheets = await project.getSheetsWithNames();
    const initialCommitSheets =  await getCommitSheets(sheets, initialCommit);
    const finalCommitSheets =  await getCommitSheets(sheets, finalCommit);

    // remove commit prefixes
    const initialCommitPrefix = `saga-${initialCommit}-`;
    const finalCommitPrefix = `saga-${finalCommit}-`;

    const initialSheetNames = removePrefix(initialCommitSheets, initialCommitPrefix);
    const finalSheetNames = removePrefix(finalCommitSheets, finalCommitPrefix);

    const insertedSheetNames = findInsertedSheets(initialSheetNames, finalSheetNames)
    const deletedSheetNames = findDeletedSheets(initialSheetNames, finalSheetNames)
    const modifiedSheetNames = findModifiedSheets(initialSheetNames, finalSheetNames)

    console.log("inserted sheets", insertedSheetNames)
    console.log("deleted sheets", deletedSheetNames)
    console.log("modified sheets", modifiedSheetNames)

    const modifiedSheetNamePairs = getSheetNamePairs(modifiedSheetNames, initialCommitPrefix, finalCommitPrefix)

    let sheetChanges = []

    // Calculate changes on modified sheets
    for (var i = 0; i < modifiedSheetNamePairs.length; i++) {
        const initialFormulas = await getFormulas(context, modifiedSheetNamePairs[i].initialSheet);
        const finalFormulas = await getFormulas(context, modifiedSheetNamePairs[i].finalSheet);

        const result = simpleDiff2D(initialFormulas, finalFormulas, modifiedSheetNamePairs[i].sheetName)
        sheetChanges.push(result)
    }

    // Add change object for inserted sheets
    for (var j = 0; j < insertedSheetNames.length; j++) {
        sheetChanges.push({
            sheet: insertedSheetNames[j], 
            changeType: changeType.INSERTED, 
            changes: []
        })
    }

    // Add change object for deleted sheets
    for (var h = 0; h < deletedSheetNames.length; h++) {
        sheetChanges.push({
            sheet: deletedSheetNames[h], 
            changeType: changeType.DELETED, 
            changes: []
        })
    }

    console.log("found the following changes", sheetChanges)
    return sheetChanges
}

async function catchUp(context) {
    // TODO: Find last time use caught up
    const project = new Project(context)

    // For now, use the first commit in the project
    const worksheets = context.workbook.worksheets;
    const sagaWorksheet = worksheets.getItem('saga')
    const firstCommitRange = sagaWorksheet.getRange("D2");
    firstCommitRange.load("values")
    await context.sync();

    const initialCommit = firstCommitRange.values
    const finalCommit = await project.getCommitIDFromBranch("master");

    const changes = await diff(context, initialCommit, finalCommit);

    // TODO: Update last time user caught up to now
    return changes
}


export async function runDiff(initialCommit, finalCommit) {
    return runOperation(diff, initialCommit, finalCommit);
}

export async function runCatchUp() {
    return runOperation(catchUp);
}
