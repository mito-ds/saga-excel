import { getSheetsWithNames, copySheet, deleteNonsagaSheets } from "./sagaUtils";


/*
Returns true if CommitID exists; false otherwise
*/
async function doesCommitIDExist(context, commitID) {    
    //Get the Commit Worksheet
    const commitWorksheet = context.workbook.worksheets.getItem("saga-commits");
    var searchRange = commitWorksheet.getRange("A1:A10"); // TODO: name this object = column of all commits!
     
    var foundRange = searchRange.findOrNullObject(commitID, {
        completeMatch: true, // find will match the whole cell value
        matchCase: false, // find will not match case
    });

    foundRange.load("values");
    await context.sync();

    // Return True / False
    if (foundRange.isNullObject) {
        return false;
    } else {
        return true;
    }
}


/*
Restores the state of a given commit to the active state
*/
export async function restoreCommit(context, commitID) {


    // Check if CommitID Exists
    const CommitIDExists = await doesCommitIDExist(context, commitID);
    if (!CommitIDExists) {
        return;
    }

    // Get all sheets with their names
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return sheet.name.startsWith("saga-" + commitID);
    })

    // Delete Non Saga Sheets
    await deleteNonsagaSheets(context)

    // Make Commited Sheet Visible
    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const newName = sheet.name.split(`saga-${commitID}-`)[1];
        await copySheet(
            context, 
            sheet.name, 
            newName, 
            Excel.WorksheetPositionType.beginning, //TODO: we have to store og location
            Excel.SheetVisibility.visible
        );
    }
    return;

}
