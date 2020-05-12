import { runCreateSaga, createRemoteURL } from "../saga/create";
import { runOperation } from "../saga/runOperation";
import { getSheetsWithNames } from "../saga/sagaUtils";
import { strict as assert } from 'assert';
import { item, mergeState, taskpaneStatus } from '../constants';
import { runCleanup } from "../saga/cleanup";
import { getGlobal } from "../commands/commands";

/* global Excel */


async function getItemRangeValues(context, itemName) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const storedItem = worksheet.names.getItem(itemName);
    storedItem.load(`value`);
    await context.sync();
    const range = worksheet.getRange(storedItem.value);
    range.load("values");
    await context.sync();
    return range.values;
}

async function getValues(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("values");
    await context.sync();
    return range.values;
}

async function getFormulas(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("formulas");
    await context.sync();
    return range.formulas;
}


export async function testCreateSaga() {
    
    // First, we create the project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

    // Then, we check that the sheets were created correctly
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 3, "Should have created 3 sheets");
    assert(sheets.find(sheet => sheet.name === "saga"), "No saga sheet was created");

    // and also that the url and email are stored correctly
    const storedURL = (await runOperation(getItemRangeValues, item.REMOTE_URL))[0][0]; 
    assert.equal(remoteURL, storedURL, "Wrong remote URL stored");

    const storedEmail = (await runOperation(getItemRangeValues, item.PERSONAL_BRANCH))[0][0]; 
    assert.equal("email", storedEmail, "Wrong remote URL stored");

    return true;
}


export async function testCleanup() {
    
    // First, we create the project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

    // Then, we cleanup the project
    await runCleanup();

    // Then, we make sure there is only a single sheet
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 1, "Should have created 3 sheets");

    return true;
}
  
export async function testEmptyMerge() {
    
    // First, we create the project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

    // Then, we call the merge function
    const g = getGlobal();
    const mergeResult = await g.merge();

    assert.equal(mergeResult, mergeState.MERGE_SUCCESS, "Empty merge should be successful");
    const sheets = await runOperation(getSheetsWithNames);
    assert.equal(sheets.length, 5, "Should have created 3 commit sheets, 1 checked out sheet, and one saga sheet");

    // Check that the taskpane is in the right state and merge state
    assert.equal(taskpaneStatus.MERGE, window.app.getTaskpaneStatus(), "Should be in a merge state");
    assert.equal(mergeState.MERGE_SUCCESS, window.app.getMergeState(), "Should be in a successful merge");

    return true;
}

export async function testSwitchVersions() {
    
    // First, we create the project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

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



export async function testMergeThenSwitchVersions() {
    
    // First, we create the project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

    // Do a merge and make sure it works
    const g = getGlobal();
    const mergeResult = await g.merge();

    assert.equal(mergeResult, mergeState.MERGE_SUCCESS, "Empty merge should be successful");

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

        const sheet2 = sheet1.copy("End")
        sheet2.name = "Sheet2";
        sheet2.getRange("A1").values = [["=Sheet1!A1"]];

        await context.sync();

    });


    // Then we create the project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

    // Do a merge and make sure it works
    const g = getGlobal();
    const mergeResult = await g.merge();
    assert.equal(mergeResult, mergeState.MERGE_SUCCESS, "Empty merge should be successful");

    // Then, we check to make sure that the values are correctly set
    const sheet1A1 = (await runOperation(getValues, "Sheet1", "A1"))[0][0];
    const sheet2A1 = (await runOperation(getFormulas, "Sheet2", "A1"))[0][0];

    assert.equal(sheet1A1, 10, "Wrong value in Sheet1!A1");
    assert.equal(sheet2A1, "=Sheet1!A1", "Wrong formula in Sheet2!A1");

    return true;
}

/*
    TODO:
    - write tests for the rest of the buttons: (reset personal, etc)
    - write tests for merge with some data
    - Figure out how to simulate a sync? Can we fake it. 
*/