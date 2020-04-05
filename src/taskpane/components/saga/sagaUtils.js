

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
Update the value of a named item in the saga metadata sheet.
Errors if the item does not exist
*/
export async function updateMetadataItem(context, itemName, newItem) {
    const worksheet = context.workbook.worksheets.getItem("saga");

    const oldItem = worksheet.names.getItem(itemName);
    oldItem.delete();
    worksheet.names.add(itemName, newItem);

    await context.sync();
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

    await context.sync();

    return copiedSheet;
}

/*
Copies srcWorksheetName to dstWorksheetName, with the given visibility parameters
*/
export async function copySheet(
        context, 
        srcWorksheetName, 
        dstWorksheetName,
        worksheetPositionType,
        worksheetVisibility
    ) {
    // copy a sheet
    const activeSheet = context.workbook.worksheets.getItemOrNullObject(srcWorksheetName);
    const copiedSheet = activeSheet.copy(worksheetPositionType);
    // Set the name and visibiliy
    await context.sync();
    copiedSheet.name = dstWorksheetName;
    copiedSheet.visibility = worksheetVisibility;

    console.log(
        `Copied ${srcWorksheetName} to ${dstWorksheetName}
         at position ${worksheetPositionType} and set to ${worksheetVisibility}`
    );

    return context.sync();
}

/*
Returns a random 14-digit string.
*/
export function getRandomID() {
    return Math.random().toString(36).substring(2, 15);
}


export async function getFormulas(context, sheetName) {
  // Get's the defined range and prints it
  var sheet = context.workbook.worksheets.getItem(sheetName);
  var usedRange = sheet.getUsedRange(true);
  // Have to load and then sync to run the command
  usedRange.load("formulas")
  await context.sync();
  return usedRange.formulas;
}

/*
Deletes all sheets whose name does not begin with "saga"
*/
export async function deleteNonsagaSheets(context) {
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })

    sheets.forEach(sheet => sheet.delete());

    await context.sync();
}



