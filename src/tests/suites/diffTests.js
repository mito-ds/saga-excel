import { strict as assert } from 'assert';
import { changeType } from "../../constants";
import { runReplaceFromBase64 } from "../../saga/create";
import { getGlobal } from "../../utils";
import * as scenarios from "../scenarios";

export async function testDiffSimple() {
    // Load scenario
    const fileContents = scenarios["diffSimple"].fileContents;
    await runReplaceFromBase64(fileContents);

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
    ];

    // Check that the changes are correct
    assert.deepEqual(catchUpResult, expected, "diffs were different (haha) than expected");
    return true;
}


export async function acrossSheetsDiff() {
    
    // Load scenario
    const fileContents = scenarios["acrossSheetsDiff"].fileContents;
    await runReplaceFromBase64(fileContents);

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
    await runReplaceFromBase64(fileContents);

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


export async function testDiffMedium() {
    // Load scenario
    const fileContents = scenarios["diffMedium"].fileContents;
    await runReplaceFromBase64(fileContents);

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
    ];

    console.log(catchUpResult);
    console.log(expected);

    // Check that the changes are correct
    assert.deepEqual(catchUpResult, expected, "catch up medium test failed");
    return true;
}
