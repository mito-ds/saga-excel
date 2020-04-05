import { getSheetsWithNames, copySheet, getRandomID } from "./sagaUtils";

/*
Gets the commit ID for a given branch name, 
returns null? if the branch does not exist, 
and "" if the branch has no previous commits on it
*/
export async function getCommitIDFromBranch(context, branch) {
    // find the instance of the branch in the saga sheet
    // return null if it doesn't exist (maybe "") works too
    const worksheet = context.workbook.worksheets.getItem("saga");
    var searchRange = worksheet.getRange("C1:C10"); // TODO: name this object!
    // TODO: don't just get B10 you fool!!!! This will be a bug once more than 10 branches!
    var foundRange = searchRange.find(branch, {
        completeMatch: true, // find will match the whole cell value
        matchCase: false, // find will not match case
    });
    // TODO: handle case where branch doesn't exist!
    foundRange.load("address")
    await context.sync();
    const commitRangeAddress = "C" + foundRange.address.split("saga!C")[1];
    const commitRange = worksheet.getRange(commitRangeAddress);
    commitRange.load("values");
    await context.sync();
    const commitID = commitRange.values[0][0];
    return commitID;
}

/*
Returns the branch in the HEAD variable
*/
export async function getHeadBranch(context) {
    const worksheet = context.workbook.worksheets.getItem("saga");
    const range = worksheet.getRange("A2");
    range.load("values");
    await context.sync();
    return range.values[0][0];
}

/*
Returns the branch in the HEAD variable
*/
async function addCommitID(context, commitID, parentID, commitName, commitMessage) {
    const worksheet = context.workbook.worksheets.getItem("saga-commits");
    const range = worksheet.getUsedRange();
    range.load('rowCount');
    await context.sync();
    const rowCount = range.rowCount;
    const newRangeAddress = 'A' + (rowCount + 1) + ":E" + (rowCount + 1);
    const newRange = worksheet.getRange(newRangeAddress);
    newRange.values = [[commitID, parentID, 1, commitName, commitMessage]];
    // TODO: numSheets = sheetNames.length, and save

    return context.sync();

}

/*
Returns the branch in the HEAD variable
*/
async function updateBranchCommitID(context, branch, commitID) {
    const worksheet = context.workbook.worksheets.getItem("saga");
    var searchRange = worksheet.getRange("C1:C10"); // TODO: name this object!
    // TODO: don't just get B10 you fool!!!! This will be a bug once more than 10 branches!
    console.log("FINDING BRANCH", branch);
    var foundRange = searchRange.find(branch, {
        completeMatch: true, // find will match the whole cell value
        matchCase: false, // find will not match case
    });
    // TODO: handle case where branch doesn't exist!
    foundRange.load("address")
    await context.sync();
    console.log("FOUND ADDRESS: ", foundRange.address)
    const commitRangeAddress = "D" + foundRange.address.split("saga!C")[1];
    console.log("commitRangeAddress", commitRangeAddress);
    const commitRange = worksheet.getRange(commitRangeAddress);
    commitRange.values = [[commitID]];
    return context.sync();
}

/*
Saves a copy off all current non-saga sheets.
If the sheet is named 'data', it will be saved at 
'saga-{commitID}-data'
*/
async function saveSheets(context, sheetNames, commitID) {
    // TODO: could be done in parallel! we don't need to sync context during, hopefully.
    for (var i = 0; i < sheetNames.length; i++) {
        const srcWorksheetName = sheetNames[i];
        const dstWorksheetName = 'saga-' + commitID + '-' + srcWorksheetName;
        console.log(dstWorksheetName); 
        await copySheet(
            context, 
            srcWorksheetName, 
            dstWorksheetName, 
            Excel.WorksheetPositionType.end,
            Excel.SheetVisibility.visible
        );
    }

    return context.sync();
}

/*
Creates a new commit on the given branch
*/
export async function commit(context, commitName, commitMessage, branch) {
    if (!branch) {
        branch = await getHeadBranch(context);
    }
    console.log(`COMMITING ON BRANCH ${branch}`)


    // Create a new commit ID
    const commitID = getRandomID();

    // Find the names of all the sheets we have to copy to this commit
    const sheets = (await getSheetsWithNames(context)).filter((sheet) => {
        return !sheet.name.startsWith("saga");
    });

    const sheetNames = sheets.map(sheet => sheet.name);
    console.log("SAVING SHEETS");
    
    // backup the sheet data
    await saveSheets(context, sheetNames, commitID);

    // save the commit id with it's parent
    console.log("GETTING PARENT ID")
    const parentID = await getCommitIDFromBranch(context, branch);
    console.log("PARENT ID", parentID);
    await updateBranchCommitID(context, branch, commitID);
    console.log("updated branch commit id");
    await addCommitID(context, commitID, parentID, commitName, commitMessage);
    console.log("added commit id");

    return context.sync();
}