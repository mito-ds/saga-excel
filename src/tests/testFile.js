import { runCreateSaga, createRemoteURL } from "../saga/create";
import { runOperation } from "../saga/runOperation";
import { getSheetsWithNames } from "../saga/sagaUtils";
import { strict as assert } from 'assert';
import { item, mergeState, taskpaneStatus } from '../constants';
import { runCleanup } from "../saga/cleanup";
import { getGlobal } from "../commands/commands";
import { TEST_URL, changeType } from "../constants";
import * as scenarios from "../../scenarios";
import { runReplaceFromBase64 } from "../saga/create";
import { runResolveMergeConflicts }  from "../saga/merge"; 
import Project from "../saga/Project";
/* global Excel */


async function getItemRangeValues(context, itemName) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const storedItem = worksheet.names.getItem(itemName);
    storedItem.load(`value`);
    await context.sync();
    const range = worksheet.getRange(storedItem.value);
    range.load("values");
    await context.sync();
    return range.values;
}

async function getValues(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("values");
    await context.sync();
    return range.values;
}

async function getFormulas(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("formulas");
    await context.sync();
    return range.formulas;
}


export async function testCreateSaga() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we check that the sheets were created correctly
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 3, "Should have created 3 sheets");
    assert(sheets.find(sheet => sheet.name === "saga"), "No saga sheet was created");

    // and also that the url and email are stored correctly
    const storedURL = (await runOperation(getItemRangeValues, item.REMOTE_URL))[0][0]; 
    assert.equal(TEST_URL, storedURL, "Wrong remote URL stored");

    const storedEmail = (await runOperation(getItemRangeValues, item.PERSONAL_BRANCH))[0][0]; 
    assert.equal("email", storedEmail, "Wrong remote URL stored");

    return true;
}



export async function testCleanup() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we cleanup the project
    await runCleanup();

    // Then, we make sure there is only a single sheet
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 1, "Should have created 3 sheets");

    return true;
}
  
export async function testEmptyMerge() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we call the merge function
    const g = getGlobal();
    const mergeResult = await g.merge();

    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Empty merge should be successful");
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 5, "Should have created 3 commit sheets, 1 checked out sheet, and one saga sheet");

    // Check that the taskpane is in the right state and merge state
    assert.equal(taskpaneStatus.MERGE, window.app.getTaskpaneStatus(), "Should be in a merge state");
    assert.equal(mergeState.MERGE_SUCCESS, window.app.getMergeState(), "Should be in a successful merge");

    return true;
}

export async function testSwitchVersions() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we make sure the personal branch is checked out
    const head = (await runOperation(getItemRangeValues, item.HEAD))[0][0];
    assert.equal("email", head, "Personal branch should be checked out");

    // Then, we switch versions
    const g = getGlobal();
    await g.switchVersion();

    const newHead = (await runOperation(getItemRangeValues, item.HEAD))[0][0];
    assert.equal("master", newHead, "Master branch should be checked out");

    await g.switchVersion();
    const newNewHead = (await runOperation(getItemRangeValues, item.HEAD))[0][0];
    assert.equal("email", newNewHead, "Personal branch should be checked out again");

    return true;
}

export async function testMergeThenSwitchVersions() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Do a merge and make sure it works
    const g = getGlobal();
    const mergeResult = await g.merge();

    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Empty merge should be successful");

    // Then, we make sure the personal branch is checked out
    const head = (await runOperation(getItemRangeValues, item.HEAD))[0][0];
    assert.equal("email", head, "Personal branch should be checked out");

    // Then, we switch versions
    await g.switchVersion();

    const newHead = (await runOperation(getItemRangeValues, item.HEAD))[0][0];
    assert.equal("master", newHead, "Master branch should be checked out");

    await g.switchVersion();
    const newNewHead = (await runOperation(getItemRangeValues, item.HEAD))[0][0];
    assert.equal("email", newNewHead, "Personal branch should be checked out again");

    return true;
}

export async function testMergePreservesCrossSheetReferences() {

    // First, we make another sheet, called sheet 2, and fill it in with some data
    // that references Sheet1
    await Excel.run(async (context) => {
        const sheet1 = context.workbook.worksheets.getItem("Sheet1");
        sheet1.getRange("A1").values = [["10"]];

        const sheet2 = sheet1.copy("End")
        sheet2.name = "Sheet2";
        sheet2.getRange("A1").values = [["=Sheet1!A1"]];

        await context.sync();

    });


    // Then we create the project
    await runCreateSaga(TEST_URL, "email");

    // Do a merge and make sure it works
    const g = getGlobal();
    const mergeResult = await g.merge();
    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Empty merge should be successful");

    // Then, we check to make sure that the values are correctly set
    const sheet1A1 = (await runOperation(getValues, "Sheet1", "A1"))[0][0];
    const sheet2A1 = (await runOperation(getFormulas, "Sheet2", "A1"))[0][0];

    assert.equal(sheet1A1, 10, "Wrong value in Sheet1!A1");
    assert.equal(sheet2A1, "=Sheet1!A1", "Wrong formula in Sheet2!A1");

    return true;
}

export async function testOriginalEmptyMergeConflict() {
    // Load scenario
    const fileContents = scenarios["mergeConflictSimpleEmptyOrigin"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();

    const expected = 
        {
            mergeConflictData: [
                {sheet: "Sheet1", result: [[5]], conflicts: 
                    [
                        {sheet: "Sheet1", cellOrRow: "A1", conflictType: "cell", a: 5, b: 10, o: ""}
                    ]
                }
            ],
            status: "merge_conflict"
        }

    // Check that the conflict is correct
    assert.deepEqual(mergeResult, expected, "merge conflict did not return correct value")

    // Then resolve merge conflicts
    const resolutions = {"Sheet1": [{cellOrRow: "A1", value: "10"}]}
    await runResolveMergeConflicts(resolutions)

    // Check that merge conflicts are resolved correctly
    const updatedValue= (await runOperation(getFormulas, "Sheet1", "A1"))[0][0];
    assert.equal(updatedValue, 10, "updated to the wrong value")

    return true;
}

export async function testAddingColumnMergeConflict() {
    // Load scenario
    const fileContents = scenarios["addingColumnUnmerged"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();

    console.log(mergeResult)

    // Check that there is no merge conflict
    assert.deepEqual(mergeResult, {}, "there was a merge conflict")

    return true;
}

export async function testMergeConflict() {
    
    // Load scenario
    const fileContents = scenarios["twoPageUnmergedConflict"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();
    console.log(mergeResult)
    assert.equal(mergeResult.status, mergeState.MERGE_CONFLICT, "Should be a merge conflict");


    // Check that the conflict is correct
    const mergeConflictData = mergeResult.mergeConflictData;
    
    assert.equal(mergeConflictData[0].sheet, "Sheet2", "should contain conflicts on Sheet 2")
    assert.equal(mergeConflictData[0].result[0][0], "M-S2-A1", "should have evaluated to M-S2-A1")
    assert.equal(mergeConflictData[0].conflicts[0].conflictType, "cell", "should have identified a cell conflict")
    assert.equal(mergeConflictData[0].conflicts[0].cellOrRow, "A1", "should have found merge conflict on A1")
    assert.equal(mergeConflictData[0].conflicts[0].a, "M-S2-A1", "should have returned M-S2-A1 as the a value")
    assert.equal(mergeConflictData[0].conflicts[0].b, "P-S2-A1", "should have returned P-S2-A1 as the b value")
    assert.equal(mergeConflictData[0].conflicts[0].o, "O-S2-A1", "should have returned O-S2-A1 as the o value")

    assert.equal(mergeConflictData[1].sheet, "Sheet1", "should contain conflicts on Sheet 1")
    assert.equal(mergeConflictData[1].result[0][0], "M-S1-A1", "should have evaluated to M-S1-A1")
    assert.equal(mergeConflictData[1].conflicts[0].conflictType, "cell", "should have identified a cell conflict")
    assert.equal(mergeConflictData[1].conflicts[0].cellOrRow, "A1", "should have found merge conflict on A1")
    assert.equal(mergeConflictData[1].conflicts[0].a, "M-S1-A1", "should have returned M-S1-A1 as the a value")
    assert.equal(mergeConflictData[1].conflicts[0].b, "P-S1-A1", "should have returned P-S1-A1 as the b value")
    assert.equal(mergeConflictData[1].conflicts[0].o, "O-S1-A1", "should have returned O-S1-A1 as the o value")

    // Then resolve merge conflicts
    const resolutions = {"Sheet2": [{cellOrRow: "A1", value: "O-S2-A1"}], "Sheet1": [{cellOrRow: "A1", value: "O-S1-A1"}]}
    await runResolveMergeConflicts(resolutions)

    // Check that merge conflicts are resolved correctly
    const personalSheet1A1 = (await runOperation(getValues, "Sheet1", "A1"))[0][0];
    const personalSheet2A1 = (await runOperation(getFormulas, "Sheet2", "A1"))[0][0];

    const masterCommitID = (await runOperation(getFormulas, "saga", "C1"))
    const masterSheet1A1 = (await runOperation(getValues, `saga-${masterCommitID}-Sheet1`, "A1"))[0][0];
    const masterSheet2A1 = (await runOperation(getFormulas, `saga-${masterCommitID}-Sheet2`, "A1"))[0][0];

    assert.equal(personalSheet1A1, "O-S1-A1", "should have correctly updated the personal sheet1 A1")
    assert.equal(personalSheet2A1, "O-S2-A1", "should have correctly updated the personal sheet2 A1")
    assert.equal(masterSheet1A1, "O-S1-A1", "should have correctly updated the master sheet1 A1")
    assert.equal(masterSheet2A1, "O-S2-A1", "should have correctly updated the master sheet2 A1")

    //TODO: Ensure that a new commit is made on master so that sync works
    return true;
}

export async function testGetSetLastCatchUp() {

    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we check that the last catch up is the first commit.
    let originalLastCatchUp;
    let masterCommit;
    let newLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        originalLastCatchUp = await project.getLastCatchUpCommitID();
        masterCommit = await project.getCommitIDFromBranch("master")
        
        // And we try and update it
        await project.setLastCatchUpCommitID("secondcommit")
        newLastCatchUp = await project.getLastCatchUpCommitID();

    });

    assert.equal(originalLastCatchUp, masterCommit);
    assert.equal(newLastCatchUp, "secondcommit");
    return true;
}

export async function testResetPersonalChangesLastCaughtUp() {

    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Then, we check that the last catch up is the first commit.
    let originalLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        originalLastCatchUp = await project.getLastCatchUpCommitID();
    });
    assert.equal(originalLastCatchUp, "firstcommit");

    const g = getGlobal();
    await g.resetPersonalVersion();

    // Then, we check that the last catch up is the first commit.
    let masterHeadCommitID;
    let newLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        masterHeadCommitID = await project.getCommitIDFromBranch("master");
        newLastCatchUp = await project.getLastCatchUpCommitID();
    });
    assert.equal(masterHeadCommitID, newLastCatchUp)

    return true;
}

export async function testMergeChangesLastCaughtUp() {

    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Then, we check that the last catch up is the first commit.
    let originalLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        originalLastCatchUp = await project.getLastCatchUpCommitID();
    });
    assert.equal(originalLastCatchUp, "firstcommit");

    const g = getGlobal();
    await g.merge();

    // Then, we check that the last catch up is the first commit.
    let masterHeadCommitID;
    let newLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        masterHeadCommitID = await project.getCommitIDFromBranch("master");
        newLastCatchUp = await project.getLastCatchUpCommitID();
    });
    assert.equal(masterHeadCommitID, newLastCatchUp)

    return true;
}


export async function acrossSheetsDiff() {
    
    // Load scenario
    const fileContents = scenarios["acrossSheetsDiff"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Then, we get the diffs
    const g = getGlobal();
    const newDiffs = await g.catchUp();
    assert.equal(newDiffs.length, 1);
    assert.equal(newDiffs[0].sheetName, "Sheet2");
    assert.equal(newDiffs[0].changeType, changeType.MODIFIED);
    assert.equal(newDiffs[0].changes.length, 1);
    assert.equal(newDiffs[0].changes[0].initialValue, "='Sheet1'!A1");
    assert.equal(newDiffs[0].changes[0].finalValue, "='Sheet1'!A1 + 1");


    return true;   
}

export async function testNoDiffAfterMerge() {
    
    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const catchUpResult = await g.catchUp();
    assert.equal(catchUpResult.length, 1, "There should be changes on the one sheet");

    await g.merge();

    const newDiffs = await g.catchUp();
    console.log("NEW DIFFS", newDiffs);
    assert.equal(newDiffs.length, 0, "There should be no diffs to catch up on after a merge");

    return true;
}

export async function testDiffSimple() {
    // Load scenario
    const fileContents = scenarios["diffSimple"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const catchUpResult = await g.catchUp();

    const expected = [
        {sheetName: "Sheet1", changeType: "Modified", changes: 
            [
                {cell: "C1", initialValue: "", finalValue: "new-value"},
                {cell: "A3", initialValue: 3, finalValue: "changed-value"}
            ]
        }, 
        {sheetName: "Sheet2", changeType: "Inserted", changes: []}
    ]

    // Check that the changes are correct
    assert.deepEqual(catchUpResult, expected, "diffs were different (haha) than expected");
    return true
}

export async function testDiffCrossSheet() {
    // Load scenario
    const fileContents = scenarios["diffCrossSheet"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const catchUpResult = await g.catchUp();

    const expected = [
        {sheetName: "Sheet2", changeType: "Modified", changes: 
            [
                {cell: "A1", initialValue: "= 'Sheet1'!A1", finalValue: "= 'Sheet1'!A1 + 1"},
            ]
        } 
    ]

    console.log(catchUpResult)
    console.log(expected)


    // Check that the changes are correct
    assert.deepEqual(catchUpResult, expected, "cross sheet differences did not return correct result");
    return true
}

export async function testDiffMedium() {
    // Load scenario
    const fileContents = scenarios["diffMedium"].fileContents;
    await runReplaceFromBase64(fileContents)

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform a merge
    const g = getGlobal();
    const catchUpResult = await g.catchUp();

    const expected = [
        {sheetName: "Model", changeType: "Modified", changes: 
            [
                { cell: "B2", initialValue: 1, finalValue: 1.3},
                { cell: "A3", initialValue: 2, finalValue: "= A2 + 1"},
                { cell: "A4", initialValue: 3, finalValue: "= A3 + 1"},
                { cell: "A5", initialValue: 4, finalValue: "= A4 + 1"},
                { cell: "A6", initialValue: 5, finalValue: "= A5 + 1"},
                { cell: "A7", initialValue: 6, finalValue: "= A6 + 1"},
                { cell: "B7", initialValue: 1.95, finalValue: 2.5},
                { cell: "A8", initialValue: 7, finalValue: "= A7 + 1"},
                { cell: "A9", initialValue: 8, finalValue: "= A8 + 1"},
                { cell: "A10", initialValue: 9, finalValue: "= A9 + 1"},
                { cell: "A11", initialValue: 10, finalValue: "= A10 + 1"},
                { cell: "A12", initialValue: 11, finalValue: "= A11 + 1"},
                { cell: "A13", initialValue: 12, finalValue: "= A12 + 1"},
                { cell: "A14", initialValue: 13, finalValue: "= A13 + 1"},
                { cell: "A15", initialValue: 14, finalValue: "= A14 + 1"},
                { cell: "A16", initialValue: 15, finalValue: "= A15 + 1"},
                { cell: "A17", initialValue: 16, finalValue: "= A16 + 1"},
                { cell: "A18", initialValue: 17, finalValue: "= A17 + 1"},
                { cell: "A19", initialValue: 18, finalValue: "= A18 + 1"},
                { cell: "A20", initialValue: 19, finalValue: "= A19 + 1"},
                { cell: "A21", initialValue: 20, finalValue: "= A20 + 1"},
                { cell: "A22", initialValue: "", finalValue: "= A21 + 1"},
                { cell: "B22", initialValue: "", finalValue: 7},
                { cell: "C22", initialValue: "", finalValue: "=(B22-B21) / B21"}
            ]
        },
        {sheetName: "Outputs", changeType: "Modified", changes: 
            [
                { cell: "A1", initialValue: "Average Yearly Growth ", finalValue: "Avg. Yearly Growth "},
                { cell: "B1", initialValue: "= AVERAGE('Model'!C3:C21)", finalValue: "= AVERAGE('Model'!C3:C22)"}
            ]
        },
        {sheetName: "Title", changeType: "Inserted", changes: []} 
    ]

    console.log(catchUpResult)
    console.log(expected)


    // Check that the changes are correct
    assert.deepEqual(catchUpResult, expected, "catch up medium test failed");
    return true
}


/*
    TODO:
    - write tests for the rest of the buttons: (reset personal, etc)
    - write tests for merge with some data
    - Figure out how to simulate a sync? Can we fake it somehow...
*/