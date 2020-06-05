import { strict as assert } from 'assert';
import { runCreateSaga, runReplaceFromBase64 } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { item, TEST_URL, mergeState, taskpaneStatus } from "../../constants";
import { getSheetsWithNames } from "../../saga/sagaUtils";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../../../scenarios";
import Project from "../../saga/Project";
import { getItemRangeValues, getFormulas, getValues } from "../testHelpers";

/* global Excel */


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

        const sheet2 = sheet1.copy("End");
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


export async function testMergeChangesLastCaughtUp() {

    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents);

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
    assert.equal(masterHeadCommitID, newLastCatchUp);

    return true;
}


export async function testNoDiffAfterMerge() {
    
    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Catch up
    const g = getGlobal();
    const catchUpResult = await g.catchUp();
    assert.equal(catchUpResult.length, 1, "There should be changes on the one sheet");

    // Then merge
    await g.merge();

    // Then catch up again
    const newDiffs = await g.catchUp();
    console.log("NEW DIFFS", newDiffs);
    assert.equal(newDiffs.length, 0, "There should be no diffs to catch up on after a merge");

    return true;
}

