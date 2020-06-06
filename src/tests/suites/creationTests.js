import assert from "assert";
import { runCreateSaga } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { item, TEST_URL } from "../../constants";
import { getSheetsWithNames, createSheet } from "../../saga/sagaUtils";
import { getItemRangeValues } from "../testHelpers";

/* global Excel */

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

const LONG_SHEET_NAME = "30characterswhichisamostthemax";

export async function testCreateSagaLongSheetNames() {

    // Create a sheet with a long name
    await Excel.run(async (context) => {
        await createSheet(context, LONG_SHEET_NAME, Excel.SheetVisibility.visible);
    });
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we check that the sheets were created correctly
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 3, "Should have created 3 sheets");
    assert(sheets.find(sheet => sheet.name === "saga"), "No saga sheet was created");

    return true;
}