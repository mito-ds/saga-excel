import { strict as assert } from 'assert';
import { runCreateSaga } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { item, TEST_URL, LONGEST_SHEET_NAME } from "../../constants";
import { getItemRangeValues } from "../testHelpers";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../scenarios";
import { runReplaceFromBase64 } from "../../saga/create";
import { getValues } from "../testHelpers";
import { getSheetsWithNames } from "../../saga/sagaUtils";



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


export async function testSwitchVersionsDoesNotDeletePersonal() {
    
    // Load scenario
    const fileContents = scenarios["switchVersionDoesNotDeletePersonal"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Switch to master version
    const g = getGlobal();
    await g.switchVersion();

    // Switch back to personal
    await g.switchVersion();

    // get remaining value at A1
    const A1 = (await runOperation(getValues, "Sheet1", "A1"))[0][0];

    assert.equal(A1, 5, "switch versions should not delete personal");

    return true;
}


export async function testSwitchVersionLongSheetNames() {
    
    // Load scenario
    const scenario = scenarios["longSheetName"];
    await runReplaceFromBase64(scenario.fileContents);

    // Then, we create a saga project here
    let created = await runCreateSaga(TEST_URL, "email");
    assert.ok(created, "Should have created a saga project successfully");

    // Switch to master version
    const g = getGlobal();
    await g.switchVersion();

    // Then, we make sure the master version has the right sheet name
    let sheets = await runOperation(getSheetsWithNames);
    let longNameSheet = sheets.find(sheet => sheet.name === LONGEST_SHEET_NAME);
    assert.notEqual(longNameSheet, undefined, "Should have found a sheet with the long sheet name");

    // Then, switch back to local and make sure that this is on personal too
    await g.switchVersion();
    sheets = await runOperation(getSheetsWithNames);
    longNameSheet = sheets.find(sheet => sheet.name === LONGEST_SHEET_NAME);
    assert.notEqual(longNameSheet, undefined, "Should have found a sheet with the long sheet name");
    
    return true;
}
