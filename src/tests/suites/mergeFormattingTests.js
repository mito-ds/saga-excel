import { strict as assert } from 'assert';
import { runReplaceFromBase64 } from "../../saga/create";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../../../scenarios";


export async function testMergeBold() {
    
    // Load scenario
    const fileContents = scenarios["diffSimple"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));
    

    // Bold A1
    await Excel.run(async function (context) {
        var sheet = context.workbook.worksheets.getItem("Sheet1");
    
        var range = sheet.getRange("A1");
        range.format.font.bold = true;
    
        return await context.sync();
    });
    
    // Perform a merge
    const g = getGlobal();
    await g.merge();
    
    // Check for boldness
    var isBold;
    await Excel.run(async function (context) {
        var sheet = context.workbook.worksheets.getItem("Sheet1");
    
        var range = sheet.getRange("A1");
        range.load("format/font/bold");
        await context.sync();

        isBold = range.format.font.bold;

        return;
    });

    assert.equal(isBold, true,  "A1 should be bold");

    return true;
    
}

export async function testMergeMultipleBolds() {
    
    // Load scenario
    const fileContents = scenarios["diffSimple"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));
    

    // Bold A1:B3
    await Excel.run(async function (context) {
        var sheet = context.workbook.worksheets.getItem("Sheet1");
    
        var range = sheet.getRange("A1:B3");
        range.load();
        await context.sync();

        range.format.font.bold = true;
    
        await context.sync();
        return;
    });
    
    // Perform a merge
    const g = getGlobal();
    await g.merge();
    
    // Check for boldness
    var isBold;
    await Excel.run(async function (context) {
        var sheet = context.workbook.worksheets.getItem("Sheet1");
    
        var range = sheet.getRange("A1:B3");
        range.load("format/font/bold");
        await context.sync();

        isBold = range.format.font.bold;
        return;
    });

    assert.equal(isBold, true, "range should be bold");
    
    return true;
}
