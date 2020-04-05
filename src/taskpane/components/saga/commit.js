import { getSheetsWithNames, copySheet, getRandomID, updateMetadataItem } from "./sagaUtils";
import Project from "./Project";

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
    const project = new Project(context);

    if (!branch) {
        branch = await project.getHeadBranch();
    }

    console.log(`making a commit on branch ${branch}`)

    // Create a new commit ID
    const commitID = getRandomID();

    // Find the names of all the sheets we have to copy to this commit
    const sheets = (await getSheetsWithNames(context)).filter((sheet) => {
        return !sheet.name.startsWith("saga");
    });

    const sheetNames = sheets.map(sheet => sheet.name);
    
    // backup the sheet data
    await saveSheets(context, sheetNames, commitID);

    // save the commit id with it's parent
    const parentID = await project.getCommitIDFromBranch(branch);
    await project.updateBranchCommitID(branch, commitID);
    await project.addCommitID(commitID, parentID, commitName, commitMessage);

    return context.sync();
}