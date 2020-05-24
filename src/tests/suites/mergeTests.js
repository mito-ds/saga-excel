import { strict as assert } from 'assert';
import { runCreateSaga, runReplaceFromBase64 } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { item, TEST_URL, mergeState, taskpaneStatus } from "../../constants";
import { getSheetsWithNames } from "../../saga/sagaUtils";
import { getGlobal } from "../../commands/commands";
import { runResolveMergeConflicts }  from "../../saga/merge";
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


export async function testSwitchVersionsThenMerge() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we make a change to the 
    await runOperation(async (context) => {
        context.workbook.worksheets.getItem("Sheet1").getRange("A1").values = [["HI"]];
        await context.sync();
    });

    // Then, we switch versions, and then switch back
    const g = getGlobal();
    await g.switchVersion();
    await g.switchVersion();

    // Then, we do a merge
    const mergeResult = await g.merge();
    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Empty merge should be successful");

    // Then, we check that the result was saved
    let cellA1 = await runOperation(async (context) => {
        const range = context.workbook.worksheets.getItem("Sheet1").getRange("A1");
        range.load("values");
        await context.sync();
        return range.values[0][0];
    });

    assert.equals("HI", cellA1, "Switching versions then merging shouldn't delete value");

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
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();
    console.log(mergeResult);
    assert.equal(mergeResult.status, mergeState.MERGE_CONFLICT, "Should be a merge conflict");


    // Check that the conflict is correct
    const mergeConflictData = mergeResult.mergeConflictData;
    
    assert.equal(mergeConflictData[0].sheet, "Sheet2", "should contain conflicts on Sheet 2");
    assert.equal(mergeConflictData[0].result[0][0], "M-S2-A1", "should have evaluated to M-S2-A1");
    assert.equal(mergeConflictData[0].conflicts[0].conflictType, "cell", "should have identified a cell conflict");
    assert.equal(mergeConflictData[0].conflicts[0].cellOrRow, "A1", "should have found merge conflict on A1");
    assert.equal(mergeConflictData[0].conflicts[0].a, "M-S2-A1", "should have returned M-S2-A1 as the a value");
    assert.equal(mergeConflictData[0].conflicts[0].b, "P-S2-A1", "should have returned P-S2-A1 as the b value");
    assert.equal(mergeConflictData[0].conflicts[0].o, "O-S2-A1", "should have returned O-S2-A1 as the o value");

    assert.equal(mergeConflictData[1].sheet, "Sheet1", "should contain conflicts on Sheet 1");
    assert.equal(mergeConflictData[1].result[0][0], "M-S1-A1", "should have evaluated to M-S1-A1");
    assert.equal(mergeConflictData[1].conflicts[0].conflictType, "cell", "should have identified a cell conflict");
    assert.equal(mergeConflictData[1].conflicts[0].cellOrRow, "A1", "should have found merge conflict on A1");
    assert.equal(mergeConflictData[1].conflicts[0].a, "M-S1-A1", "should have returned M-S1-A1 as the a value");
    assert.equal(mergeConflictData[1].conflicts[0].b, "P-S1-A1", "should have returned P-S1-A1 as the b value");
    assert.equal(mergeConflictData[1].conflicts[0].o, "O-S1-A1", "should have returned O-S1-A1 as the o value");

    // Then resolve merge conflicts
    const resolutions = {"Sheet2": [{cellOrRow: "A1", value: "O-S2-A1"}], "Sheet1": [{cellOrRow: "A1", value: "O-S1-A1"}]};
    await runResolveMergeConflicts(resolutions);

    // Check that merge conflicts are resolved correctly
    const personalSheet1A1 = (await runOperation(getValues, "Sheet1", "A1"))[0][0];
    const personalSheet2A1 = (await runOperation(getFormulas, "Sheet2", "A1"))[0][0];

    const masterCommitID = (await runOperation(getFormulas, "saga", "C1"));
    const masterSheet1A1 = (await runOperation(getValues, `saga-${masterCommitID}-Sheet1`, "A1"))[0][0];
    const masterSheet2A1 = (await runOperation(getFormulas, `saga-${masterCommitID}-Sheet2`, "A1"))[0][0];

    assert.equal(personalSheet1A1, "O-S1-A1", "should have correctly updated the personal sheet1 A1");
    assert.equal(personalSheet2A1, "O-S2-A1", "should have correctly updated the personal sheet2 A1");
    assert.equal(masterSheet1A1, "O-S1-A1", "should have correctly updated the master sheet1 A1");
    assert.equal(masterSheet2A1, "O-S2-A1", "should have correctly updated the master sheet2 A1");

    //TODO: Ensure that a new commit is made on master so that sync works
    return true;
}


export async function testMergeChangesLastCaughtUp() {

    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

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
