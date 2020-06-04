import { strict as assert } from 'assert';
import { runReplaceFromBase64 } from "../../saga/create";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../scenarios";
import { runOperation } from "../../saga/runOperation";
import { getValues } from "../testHelpers";



export async function testResetPersonal() {

    // Load scenario
    const fileContents = scenarios["unmergedConflict"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Switch to master version
    const g = getGlobal();
    await g.resetPersonalVersion();

    const A1 = (await runOperation(getValues, "Sheet1", "A1"))[0][0];

    assert.equal(A1, "master change", "switch versions should not delete personal");
    
    return true;
}