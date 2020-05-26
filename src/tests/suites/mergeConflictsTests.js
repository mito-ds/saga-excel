import { strict as assert } from 'assert';
import { runReplaceFromBase64 } from "../../saga/create";
import * as scenarios from "../../../scenarios";
import { getGlobal } from "../../commands/commands";
import { runResolveMergeConflicts }  from "../../saga/merge";
import { runOperation } from "../../saga/runOperation";
import { getFormulas, getValues } from "../testHelpers";
import { mergeState } from "../../constants";


export async function testOriginalEmptyMergeConflict() {
    // Load scenario
    const fileContents = scenarios["mergeConflictSimpleEmptyOrigin"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

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
        };

    // Check that the conflict is correct
    assert.deepEqual(mergeResult, expected, "merge conflict did not return correct value");

    // Then resolve merge conflicts
    const resolutions = {"Sheet1": [{cellOrRow: "A1", value: "10"}]};
    await runResolveMergeConflicts(resolutions);

    // Check that merge conflicts are resolved correctly
    const updatedValue= (await runOperation(getFormulas, "Sheet1", "A1"))[0][0];
    assert.equal(updatedValue, 10, "updated to the wrong value");

    return true;
}

export async function testAddingColumnMergeConflict() {
    // Load scenario
    const fileContents = scenarios["addingColumnUnmerged"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();

    console.log(mergeResult);

    // Check that there is no merge conflict
    assert.deepEqual(mergeResult, {}, "there was a merge conflict");

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

export async function testMultipleConflictsPerSheet() {
    // Load scenario
    const fileContents = scenarios["multipleMergeConflictsPerSheet"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();

    const expected = 
    {
        mergeConflictData: [
            {sheet: "Sheet2", result: [["M3", "M4"]], conflicts: 
                [
                    {conflictType: "cell", sheet: "Sheet2", cellOrRow: "A1", a: "M3", b: "P3", o: "O3"},
                    {conflictType: "cell", sheet: "Sheet2", cellOrRow: "B1", a: "M4", b: "P4", o: "O4"}
                ]
            },
            {sheet: "Sheet1", result: [["M1", "M2"]], conflicts:
                [
                    {conflictType: "cell", sheet: "Sheet1", cellOrRow: "A1", a: "M1", b: "P1", o: "O1"},
                    {conflictType: "cell", sheet: "Sheet1", cellOrRow: "B1", a: "M2", b: "P2", o: "O2"}
                ]   
            }
        ],
        status: "merge_conflict"
    };

    // Check that there is no merge conflict
    assert.deepEqual(mergeResult, expected, "there was a merge conflict");

    // Then resolve the merge conflicts
    const resolutions = {"Sheet2": [{cellOrRow: "A1", value: "P3"}, {cellOrRow: "B1", value: "P4"} ], "Sheet1": [{cellOrRow: "A1", value: "P1"}, {cellOrRow: "B1", value: "P2"}]};
    await runResolveMergeConflicts(resolutions);

    // Check that merge conflicts are resolved correctly
    const sheet1Values = await runOperation(getFormulas, "Sheet1", "A1:B1");
    assert.equal(sheet1Values[0][0], "P1", "should update Sheet 1 A1 to P1");
    assert.equal(sheet1Values[0][1], "P2", "should update Sheet 1 B1 to P2");

    const sheet2Values = await runOperation(getFormulas, "Sheet2", "A1:B1");
    assert.equal(sheet2Values[0][0], "P3", "should update Sheet 1 A1 to P3");
    assert.equal(sheet2Values[0][1], "P4", "should update Sheet 1 B1 to P4");

    return true;
}