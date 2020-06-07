import assert from "assert";
import { runCreateSaga } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { item, TEST_URL } from "../../constants";
import { getSheetsWithNames } from "../../saga/sagaUtils";
import { getItemRangeValues } from "../testHelpers";


export async function testCreateSaga() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

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