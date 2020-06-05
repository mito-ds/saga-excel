import { runOperation } from './runOperation';
import Project from "./Project";
import { checkoutCommitID } from "./checkout";


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
Returns a random 14-digit string.
*/
export function getRandomID() {
    return Math.random().toString(36).substring(2, 15);
}


// numToChar and chr are taken from https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25

export function numToChar (number) {
    var numeric = (number - 1) % 26;
    var letter = chr(65 + numeric);
    var number2 = parseInt((number - 1) / 26);
    if (number2 > 0) {
        return numToChar(number2) + letter;
    } else {
        return letter;
    }
}

// helper function to numToChar
function chr(codePt) {
    if (codePt > 0xFFFF) { 
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    return String.fromCharCode(codePt);
}

export async function getCommitSheets (sheets, commitID) {
    return sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}`);
    });
}

export async function getFormulas(context, sheetName) {
    // Get's the defined range and prints it
    var sheet = context.workbook.worksheets.getItem(sheetName);
    var usedRange = sheet.getUsedRangeOrNullObject(true);
    // Have to load and then sync to run the command
    usedRange.load("formulas");
    usedRange.load("address");
    usedRange.load("isNullObject");
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
    usedRangeWithA1.load("formulas");
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
    });

    // TODO: make it be save w/ number of sheets
    sheets.forEach(sheet => sheet.delete());

    await context.sync();
}

// TODO: have to move this to take context as input, and run through the safe channels
export async function sagaProjectExists() {
    var exists;
    try {
        await Excel.run(async (context) => {
            const sagaSheet = context.workbook.worksheets.getItemOrNullObject("saga");

            await context.sync();
            console.log("sagasheet");
            console.log(sagaSheet.isNullObject);
            exists = !sagaSheet.isNullObject;
        });
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
            const email = await project.getPersonalBranch();


            obj["remoteURL"] = remoteURL;
            obj["email"] = email;
        });
    } catch (e) {
        return obj;
    }
    return obj;
}

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
    return runOperation(selectCell, sheet, cell);
}

export async function getFirstAncestorOnMaster (context, masterHead, commitID) {
    const commitRange = await (new Project(context)).getCommitRangeWithValues();
    const commits = commitRange.values;
    console.log(commits);

    // We build a simple commit graph
    const parentCommit = {};

    commits.forEach(row => {
        console.log("row", row);
        const child = row[0];
        const parent = row[1];

        parentCommit[child] = parent;
    });

    console.log(JSON.stringify(parentCommit));

    const isMasterCommit = {'firstcommit': true};

    let currMasterCommit = masterHead;
    while (currMasterCommit !== 'firstcommit') {
        isMasterCommit[currMasterCommit] = true;
        currMasterCommit = parentCommit[currMasterCommit];
    }

    let currPersonalCommit = commitID;
    while (currPersonalCommit !== 'firstcommit') {
        if (isMasterCommit[currPersonalCommit]) {
            return currPersonalCommit;
        }
        currPersonalCommit = parentCommit[currPersonalCommit];
    }

    return 'firstcommit';
}

export async function revertToCommitAndBranch(context, commit, branch) {
    // get project
    const project = new Project(context);

    // set checked out branch to correct value
    await project.setCheckedOutBranch(branch);
            
    // revert to safety commit
    await checkoutCommitID(context, commit);
    console.log("finished reverting");
}

export async function runRevertToCommitAndBranch(commit, branch) {
    return runOperation(revertToCommitAndBranch, commit, branch);
}