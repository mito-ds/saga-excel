import assert from "assert";
import { runCreateSaga, runReplaceFromBase64 } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { item, TEST_URL } from "../../constants";
import { getSheetsWithNames } from "../../saga/sagaUtils";
import { getItemRangeValues } from "../testHelpers";
import * as scenarios from "../scenarios";

export async function testCreateSaga() {
    
    // First, we create the project
    const created = await runCreateSaga(TEST_URL, "email");
    assert.ok(created, "Should have successfully created a saga project");

    // Then, we check that the sheets were created correctly
    const sheets = (await runOperation(getSheetsWithNames)).operationResult;
    assert.equal(sheets.length, 3, "Should have created 3 sheets");
    assert(sheets.find(sheet => sheet.name === "saga"), "No saga sheet was created");

    // and also that the url and email are stored correctly
    const storedURL = (await runOperation(getItemRangeValues, item.REMOTE_URL)).operationResult[0][0]; 
    assert.equal(TEST_URL, storedURL, "Wrong remote URL stored");

    const storedEmail = (await runOperation(getItemRangeValues, item.PERSONAL_BRANCH)).operationResult[0][0]; 
    assert.equal("email", storedEmail, "Wrong remote URL stored");

    return true;
}

export async function testCreateSagaLongSheetNames() {

    const scenario = scenarios["longSheetName"];
    await runReplaceFromBase64(scenario.fileContents);
    
    // First, we create the project
    let created = await runCreateSaga(TEST_URL, "email");
    assert.ok(created, "Should have created a saga project successfully");

    // Then, we check that the sheets were created correctly
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 3, "Should have created 3 sheets");
    assert(sheets.find(sheet => sheet.name === "saga"), "No saga sheet was created");

    return true;
}

// TODO
async function testCreateSagaExistingSheetCopies() {

    const scenario = scenarios["existingSheetCopies"];
    await runReplaceFromBase64(scenario.fileContents);
    
    // First, we create the project
    let created = await runCreateSaga(TEST_URL, "email");
    assert.ok(created, "Should have created a saga project successfully");

    // Then, we check that the sheets were created correctly
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 5, "Should have created 4 sheets");
    assert(sheets.find(sheet => sheet.name === "saga"), "No saga sheet was created");
    assert(sheets.find(sheet => sheet.name === "Sheet1"), "Sheet 1 should remain");
    assert(sheets.find(sheet => sheet.name === "Sheet1 (2)"), "Sheet 2 should remain");

    return true;
}