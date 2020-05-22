import { strict as assert } from 'assert';
import { changeType } from "../../constants";
import { runReplaceFromBase64 } from "../../saga/create";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../../../scenarios";


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