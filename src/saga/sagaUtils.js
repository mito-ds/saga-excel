

/* global Excel */

/*
Efficiently gets all the worksheet objects with all their names loaded
*/
export async function getSheetsWithNames(context) {
    var sheets = context.workbook.worksheets;
    sheets.load("items/name");
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
export async function copySheets(
    context, 
    srcWorksheets, 
    dstWorksheets,
    worksheetPositionType,
    worksheetVisibility
) {
    if (srcWorksheets.length !== dstWorksheets.length) {
        console.error(`Cannot copy ${srcWorksheets} to ${dstWorksheets}, don't match up`);
        return false;
    }

    if (worksheetPositionType !== Excel.WorksheetPositionType.end && worksheetPositionType !== Excel.WorksheetPositionType.beginning) {
        console.error(`Bulk copy only supports beggining or end, not ${worksheetPositionType}`);
        return false;
    }

    console.log(srcWorksheets)
    console.log(dstWorksheets);

    if (worksheetPositionType === Excel.WorksheetPositionType.end) {
        for (let i = 0; i < srcWorksheets.length; i++) {
            const srcName = srcWorksheets[i];
            const dstName = dstWorksheets[i];
            const src = context.workbook.worksheets.getItemOrNullObject(srcName);
            const dst = src.copy(worksheetPositionType);
            dst.name = dstName;
            dst.visibility = worksheetVisibility;
    
            // We can queue at most 40 txs
            if (i % 40 === 0) {
                await context.sync();
            }
        }
    } else if (worksheetPositionType === Excel.WorksheetPositionType.beginning) {
        for (let i = srcWorksheets.length - 1; i >= 0; i--) {
            const srcName = srcWorksheets[i];
            const dstName = dstWorksheets[i];
            const src = context.workbook.worksheets.getItemOrNullObject(srcName);
            const dst = src.copy(worksheetPositionType);
            dst.name = dstName;
            dst.visibility = worksheetVisibility;
    
            // We can queue at most 40 txs
            if (i % 40 === 0) {
                await context.sync();
            }
        }
    }

    return context.sync();
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
    var usedRange = sheet.getUsedRangeOrNullObject(true);
    // Have to load and then sync to run the command
    usedRange.load("formulas")
    usedRange.load("isNullObject")
    await context.sync();
    
    if (usedRange.isNullObject) {
        return [];
    }

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

