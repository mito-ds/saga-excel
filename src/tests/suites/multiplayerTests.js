import { item } from "../../constants";
import { strict as assert } from 'assert';
import { MultiplayerScenario, getItemRangeValues } from "../testHelpers";
import { getSheetsWithNames } from "../../saga/sagaUtils";

/* global Excel */

export async function testRemoteUpdateUpdatesSagaSheet() {
    // First, we set up the basic scenario
    const scenario = new MultiplayerScenario("remoteUpdateEmpty");
    await scenario.start();

    // First, we should have just three sheets (saga, checked-out, commit), and just two commits (first and one real)
    let numSheets;
    let numCommits;
    await Excel.run(async (context) => {
        numSheets = (await getSheetsWithNames(context)).length;
        numCommits = (await getItemRangeValues(context, item.COMMITS)).length;
    });
    console.log(numCommits);
    assert.equal(numSheets, 3, "Wrong number of sheets initally in scenario");
    assert.equal(numCommits, 2, "Wrong number of commits initally in scenario");


    // Then sync, and show we updated the commit sheet appropriately
    await scenario.nextSyncStep();

    await Excel.run(async (context) => {
        numSheets = (await getSheetsWithNames(context)).length;
        numCommits = (await getItemRangeValues(context, item.COMMITS)).length;
    });
    assert.equal(numSheets, 4, "Wrong number of sheets initally in scenario");
    assert.equal(numCommits, 3, "Wrong number of commits initally in scenario");

    return true;
}

export async function testRemoteUpdateDoesNotEffectPersonal() {
    // First, we set up the basic scenario
    const scenario = new MultiplayerScenario("remoteUpdateWithData");
    await scenario.start();

    // We first make sure the checked out sheet is empty
    let values;
    await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getItem("Sheet1");
        const range = sheet.getUsedRange();
        range.load("values");
        await context.sync();
        values = range.values;
    });
    console.log(values);
    assert.deepEqual(values, [[""]], "Values should be empty");

    // Then sync, and show that it has not changed
    await scenario.nextSyncStep();

    await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getItem("Sheet1");
        const range = sheet.getUsedRange();
        range.load("values");
        await context.sync();
        values = range.values;
    });
    assert.deepEqual(values, [[""]], "Values should be empty");

    return true;
}