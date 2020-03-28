

/*
Efficiently gets all the worksheet objects with all their names loaded
*/
export async function getSheetsWithNames(context) {
    var sheets = context.workbook.worksheets;

    sheets.load("$none");
    await context.sync();

    sheets.items.forEach(sheet => sheet.load("name"));
    await context.sync();
    return sheets.items;
}

/*
Creates a new sheet with the given name and visibility. 
Errors if a sheet with that name already exists.
*/
export async function createSheet(context, worksheetName, worksheetVisibility) {
    // copy a sheet
    const activeSheet = context.workbook.worksheets.getActiveWorksheet();
    const copiedSheet = activeSheet.copy(Excel.WorksheetPositionType.end);
    // clear the sheet
    copiedSheet.getUsedRange().clear("all");
    // Set the name and visibiliy
    await context.sync();
    copiedSheet.name = worksheetName;
    copiedSheet.visibility = worksheetVisibility;

    console.log(`Created sheet ${worksheetName} and set to ${worksheetVisibility}`);

    return context.sync();
}

/*
Copies srcWorksheetName to dstWorksheetName, with the given visibility parameters
*/
export async function copySheet(context, srcWorksheetName, dstWorksheetName, worksheetVisibility) {
    // copy a sheet
    const activeSheet = context.workbook.worksheets.getItemOrNullObject(srcWorksheetName);
    const copiedSheet = activeSheet.copy(Excel.WorksheetPositionType.end);
    // Set the name and visibiliy
    await context.sync();
    copiedSheet.name = dstWorksheetName;
    copiedSheet.visibility = worksheetVisibility;

    console.log(`Copied ${srcWorksheetName} to ${dstWorksheetName} and set to ${worksheetVisibility}`);

    return context.sync();
}