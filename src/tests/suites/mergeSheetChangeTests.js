import { strict as assert } from 'assert';
import { runReplaceFromBase64 } from "../../saga/create";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../../../scenarios";
import { mergeState } from "../../constants";
import { getSheetsWithNames } from "../../saga/sagaUtils";

/* global Excel */

export async function testMergeDeleteSheet() {
    
    // Load scenario
    const fileContents = scenarios["unmergedLocalSheetDelete"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    const g = getGlobal();
    await g.merge();

    let nonSagaSheets;
    
    await Excel.run(async function (context) {
        const sheets = await getSheetsWithNames(context);
        nonSagaSheets = sheets.map(sheet => sheet.name).filter(sheetName => !sheetName.startsWith("saga"));
        return context.sync();
    });

    console.log(nonSagaSheets);

    assert.equal(1, nonSagaSheets.length, "Sheets were not deleted");
    return true;
    
}
