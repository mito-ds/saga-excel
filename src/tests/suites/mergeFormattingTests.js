import { strict as assert } from 'assert';
import { runReplaceFromBase64 } from "../../saga/create";
import { getGlobal } from "../../commands/commands";
import * as scenarios from "../../../scenarios";
import { mergeState } from "../../constants";



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
    const mergeResult = await g.merge();

    // Make sure merge was successful
    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Merge one bold event should succeed");

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
    const mergeResult = await g.merge();

    // Make sure merge was successful
    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Merge with range bolding should succeed");

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

export async function testMultiPageBold() {
    // Load scenario
    const fileContents = scenarios["diffSimple"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Bold A1 in both sheets
    // Bold A1:B3
    await Excel.run(async function (context) {
        // Bold Sheet 1
        var sheet1 = context.workbook.worksheets.getItem("Sheet1");
        var range1 = sheet1.getRange("A1");
        range1.load();
        await context.sync();
        range1.format.font.bold = true;
        await context.sync();

        // Bold Sheet 2
        var sheet2 = context.workbook.worksheets.getItem("Sheet2");
        var range2 = sheet2.getRange("A1");
        range2.load();
        await context.sync();
        range2.format.font.bold = true;
        return;
    });

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();

    // Make sure merge was successful
    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Merge with multi page formatting should succeed");

    // Check for boldness
    var isSheet1Bold;
    var isSheet2Bold;
    await Excel.run(async function (context) {
        // Check sheet 1
        var sheet1 = context.workbook.worksheets.getItem("Sheet1");
        var range1 = sheet1.getRange("A1");
        range1.load("format/font/bold");
        await context.sync();
        isSheet1Bold = range1.format.font.bold;

        var sheet2 = context.workbook.worksheets.getItem("Sheet1");
        var range2 = sheet2.getRange("A1");
        range2.load("format/font/bold");
        await context.sync();
        isSheet2Bold = range2.format.font.bold;
        return;
    });

    assert.equal(isSheet1Bold, true, "Sheet 1 is bold");
    assert.equal(isSheet2Bold, true, "Sheet 2 is bold");    
    return true;

}



export async function testMergeKeepsFromattingInMaster() {
    // Load scenario
    const fileContents = scenarios["formattingInMaster"].fileContents;
    await runReplaceFromBase64(fileContents);

    // Give time for files to update properly 
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Bold B1
    await Excel.run(async function (context) {
        // Bold Sheet 1
        var sheet1 = context.workbook.worksheets.getItem("Sheet1");
        var range1 = sheet1.getRange("B1");
        range1.load();
        await context.sync();
        range1.format.font.bold = true;
        await context.sync();
    });

    // Perform a merge
    const g = getGlobal();
    const mergeResult = await g.merge();

    // Make sure merge was successful
    assert.equal(mergeResult.status, mergeState.MERGE_SUCCESS, "Merge with multi page formatting should succeed");

    // Check for boldness
    let isA1Bold, isB1Bold;
    await Excel.run(async function (context) {
        // Check sheet 1
        var sheet1 = context.workbook.worksheets.getItem("Sheet1");
        var range1 = sheet1.getRange("A1");
        range1.load("format/font/bold");
        await context.sync();
        isA1Bold = range1.format.font.bold;

        var range2 = sheet1.getRange("B1");
        range2.load("format/font/bold");
        await context.sync();
        isB1Bold = range2.format.font.bold;
        return;
    });

    assert.equal(isA1Bold, true, "A1 from master is not bold");
    assert.equal(isB1Bold, true, "B2 from local is not bold");    
    return true;

}
