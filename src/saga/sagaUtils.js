import Project from "./Project";
import { runOperation } from './runOperation';

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

    await context.sync();

    return copiedSheet;
}

/*
Copies srcWorksheetName to dstWorksheetName, with the given visibility parameters
*/
async function copySheets(
    context, 
    srcWorksheets, 
    getNewName,
    worksheetPositionType,
    worksheetVisibility
) {

    if (worksheetPositionType !== Excel.WorksheetPositionType.end && worksheetPositionType !== Excel.WorksheetPositionType.beginning) {
        console.error(`Bulk copy only supports beggining or end, not ${worksheetPositionType}`);
        return false;
    }

    console.log(srcWorksheets)

    if (worksheetPositionType === Excel.WorksheetPositionType.end) {
        for (let i = 0; i < srcWorksheets.length; i++) {
            const srcName = srcWorksheets[i];
            const dstName = getNewName(srcName);
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
            const dstName = getNewName(srcName);
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
async function copySheet(
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

function fromColumnName(col){
    return col.split('').reduce((r, a) => r * 26 + parseInt(a, 36) - 9, 0);
}
// Taken https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25


export async function getFormulas(context, sheetName) {
    // Get's the defined range and prints it
    var sheet = context.workbook.worksheets.getItem(sheetName);
    var usedRange = sheet.getUsedRangeOrNullObject(true);
    // Have to load and then sync to run the command
    usedRange.load("formulas")
    usedRange.load("address")
    usedRange.load("isNullObject")
    await context.sync();
    
    if (usedRange.isNullObject) {
        return [[]];
    }

    const addrParts = usedRange.address.split(":");

    if (addrParts[0] === "A1") {
        return usedRange.formulas;
    }

    // Redefine the box to include the 
    const bottomRight = addrParts.length === 1 ? addrParts[0] : addrParts[1];

    var usedRangeWithA1 = sheet.getRange(`A1:${bottomRight}`);
    usedRangeWithA1.load("formulas")
    await context.sync();

    return usedRangeWithA1.formulas;

}

/*
Deletes all sheets whose name does not begin with "saga"
*/
export async function deleteNonsagaSheets(context) {
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })

    // TODO: make it be save w/ number of sheets
    sheets.forEach(sheet => sheet.delete());

    await context.sync();
}

<<<<<<< HEAD

// TODO: have to move this to take context as input, and run through the safe channels
export async function sagaProjectExists() {
    var exists;
    try {
        await Excel.run(async (context) => {
            const sagaSheet = context.workbook.worksheets.getItemOrNullObject("saga");

            await context.sync();
            console.log("sagasheet")
            console.log(sagaSheet.isNullObject)
            exists = !sagaSheet.isNullObject;
        })
    } catch (e) {
        return false;
    }
    console.log("using exists", exists);
    return exists;
}

export async function sagaProjectJSON() {
    var obj = {};
    try {
        await Excel.run(async (context) => {
            const sagaSheet = context.workbook.worksheets.getItemOrNullObject("saga");
            await context.sync();
            
            // If there is no saga project, we just return, as there is no project
            if (sagaSheet.isNullObject) {
                return;
            }

            // If there is a saga project, we get the remote URL and the email
            const project = new Project(context);
            const remoteURL = await project.getRemoteURL();
            const email = await project.getPersonalBranchName();


            obj["remoteURL"] = remoteURL;
            obj["email"] = email;
        })
    } catch (e) {
        return obj;
    }
    return obj;
}
=======
/*
Select the given cell on the given sheet
*/
async function selectCell(context, sheetName, cell) {

    // Get worksheet
    var sheet = context.workbook.worksheets.getItem(sheetName);
    sheet.activate();

    // Get Cell
    var range = sheet.getRange(cell);
    range.select();
    await context.sync();
}

export async function runSelectCell(sheet, cell) {
    return runOperation(selectCell, sheet, cell)
}

>>>>>>> merge-conflict-resolution
