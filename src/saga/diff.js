import { runOperation } from './runOperation';
import { getCommitSheets, getFormulas, numToChar } from "./sagaUtils";
import Project from "./Project";
import { getSheetNamePairs, removePrefix, findInsertedSheets, findDeletedSheets, findModifiedSheets } from "./diffUtils";
import { changeType } from '../constants'
import {ValueWrapper} from "./mergeUtils";

// find all of the changes between two 2D array representations of a sheets
export function simpleDiff2D(initialValue, finalValues, sheetName) {

    const maxNumRows = Math.max(initialValue.length, finalValues.length);
    const maxNumCols = Math.max(initialValue[0] ? initialValue[0].length : 0, finalValues[0] ? finalValues[0].length : 0);

    const initialValueWrapper = new ValueWrapper(initialValue);
    const finalValueWrapper = new ValueWrapper(finalValues);


    const changes = [];
    for (let i = 0; i < maxNumRows; i++) {
        for (let j = 0; j < maxNumCols; j++) {
            const initialValue = initialValueWrapper.getCell(i, j);
            const finalValue = finalValueWrapper.getCell(i, j);

            const columnName = numToChar(j + 1);
            const excelRow = i + 1;
            const cell = columnName + excelRow;

            if (initialValue !== finalValue) {
                changes.push({
                    sheetName: sheetName,
                    cell: cell,
                    initialValue: initialValue, 
                    finalValue: finalValue
                });
            }

        }
    }

    return changes;
}

// Finds cell level changes across two commits
async function diff(context, initialCommit, finalCommit) {
    /*
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

    const insertedSheetNames = findInsertedSheets(initialSheetNames, finalSheetNames);
    const deletedSheetNames = findDeletedSheets(initialSheetNames, finalSheetNames);
    const modifiedSheetNames = findModifiedSheets(initialSheetNames, finalSheetNames);

    console.log("inserted sheets", insertedSheetNames);
    console.log("deleted sheets", deletedSheetNames);
    console.log("modified sheets", modifiedSheetNames);

    const modifiedSheetNamePairs = getSheetNamePairs(modifiedSheetNames, initialCommitPrefix, finalCommitPrefix);

    let sheetChanges = []

    // Calculate changes on modified sheets
    for (var i = 0; i < modifiedSheetNamePairs.length; i++) {
        const initialFormulas = await getFormulas(context, modifiedSheetNamePairs[i].initialSheet);
        const finalFormulas = await getFormulas(context, modifiedSheetNamePairs[i].finalSheet);

        const changes = simpleDiff2D(initialFormulas, finalFormulas, modifiedSheetNamePairs[i].sheetName);

        // TODO: we can save if there are no changes, and just mark it as such
        if (changes.length !== 0) {
            sheetChanges.push({
                sheetName: modifiedSheetNamePairs[i].sheetName, 
                changeType: changeType.MODIFIED, 
                changes: changes
            });

        }
    }

    // Add change object for inserted sheets
    for (var j = 0; j < insertedSheetNames.length; j++) {
        sheetChanges.push({
            sheetName: insertedSheetNames[j], 
            changeType: changeType.INSERTED, 
            changes: []
        });
    }

    // Add change object for deleted sheets
    for (var h = 0; h < deletedSheetNames.length; h++) {
        sheetChanges.push({
            sheetName: deletedSheetNames[h], 
            changeType: changeType.DELETED, 
            changes: []
        });
    }

    console.log("found the following changes", sheetChanges);
    return sheetChanges;
}

async function catchUp(context) {
    // TODO: Find last time use caught up
    const project = new Project(context);

    // For now, use the first commit in the project
    const lastCaughtUpCommitID = await project.getLastCatchUpCommitID();
    const finalCommit = await project.getCommitIDFromBranch("master");

    const changes = await diff(context, lastCaughtUpCommitID, finalCommit);

    // We also update the alst time they caught up to now
    // TODO: we might wanna do this after they approve the diff
    await project.setLastCatchUpCommitID(finalCommit);

    return changes;
}


export async function runDiff(initialCommit, finalCommit) {
    return runOperation(diff, initialCommit, finalCommit);
}

export async function runCatchUp() {
    return runOperation(catchUp);
}
