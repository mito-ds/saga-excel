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

/*
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
*/
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
                {sheetName: "Sheet1", cell: "C1", initialValue: "", finalValue: "new-value"},
                {sheetName: "Sheet1", cell: "A3", initialValue: 3, finalValue: "changed-value"}
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
                {sheetName: "Sheet2", cell: "A1", initialValue: "= Sheet1!A1", finalValue: "= Sheet1!A1 + 1"},
            ]
        } 
    ]

    // Check that the changes are correct
    assert.deepEqual(catchUpResult, expected, "cross sheet differences did not return correct result");
    return true
}



/*
    TODO:
    - write tests for the rest of the buttons: (reset personal, etc)
    - write tests for merge with some data
    - Figure out how to simulate a sync? Can we fake it somehow...
*/