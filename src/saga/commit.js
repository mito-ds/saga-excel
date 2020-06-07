import { getSheetsWithNames, getRandomID } from "./sagaUtils";
import { getFileContents } from "./fileUtils";
import Project from "./Project";
import { runOperation } from "./runOperation";
import { LONGEST_SHEET_NAME_LENGTH } from "../constants";

/* global Excel */

export async function makeClique(context, sheetNames, getNewName, worksheetPositionType, worksheetVisibility) {
    if (sheetNames.length === 0) {
        return;
    }

    const fileContents = await getFileContents();
    const worksheets = context.workbook.worksheets;

    // First, we insert the new sheets
    worksheets.addFromBase64(
        fileContents,
        sheetNames,
        worksheetPositionType
    );

    await context.sync();


    /*
        Now, we go about the process of renaming these sheets. The rename does the following:
        
            1.  Tries to find the name of the sheet that was inserted (TODO: make this more robust, it
                currently doesn't handle if there is Sheet1 and Sheet1 (2) in the original file).
            2.  Uses the getNewName function to get the proposed new name of the sheet. If this is a commit
                and the new name is too long, then it will then come up with a shorter name (and save this 
                shorter name in the sheet so we can get the mapping back). If a shorter name for this long
                sheet name already exists, it will just use this.
            3.  Update the names of the sheets.
    */

    for (let i = 0; i < sheetNames.length; i++) {
        const originalName = sheetNames[i];
        const insertedName = `${originalName} (2)`;
        let newName = getNewName(originalName);
        
        if (newName.length > LONGEST_SHEET_NAME_LENGTH) {
            // If the sheet name has been extended past it's length limit, we check if we have a
            // cached version of this longer name
            const project = new Project(context);
            const existingShortName = await project.getShortSheetName(originalName);

            if (existingShortName) {
                newName = getNewName(existingShortName);
            } else {
                // If there is no existing short name, we create a new one
                const newShortSheetName = getRandomID();
                // And save it in the mapping
                await project.addSheetName(originalName, newShortSheetName);
                newName = getNewName(newShortSheetName);
            }
        }

        console.log(`Changing ${insertedName} and changing ${newName}`);
        const sheet = worksheets.getItem(insertedName);
        sheet.name = newName;
        sheet.visibility = worksheetVisibility;

        // We can queue at most 50 transaction
        if (i % 40 === 0) {
            await context.sync();
        }
    }

    return context.sync();
}


/*
Create Commit
*/
export async function commit(context, commitName, commitMessage, branch, commitID) {
    const project = new Project(context);

    // Get the name of the personal branch of the committing user

    if (!branch) {
        branch = await project.getHeadBranch();
    }

    console.log(`making a commit on branch ${branch}`);

    if (!commitID) {
        commitID = getRandomID();
    }

    // Find the names of all the sheets we have to copy to this commit
    const sheets = (await getSheetsWithNames(context)).filter((sheet) => {
        return !sheet.name.startsWith("saga");
    });

    const sheetNames = sheets.map(sheet => sheet.name);
    
    // backup the sheet data
    await makeClique(
        context, 
        sheetNames, 
        (name) => {return `saga-${commitID}-${name}`;}, 
        Excel.WorksheetPositionType.end, 
        Excel.SheetVisibility.hidden // TODO: change to very hidden, figure out deleting
    );

    // save the commit id with it's parent, and update the commit id on the branch
    const parentID = await project.getCommitIDFromBranch(branch);
    await project.addCommitID(commitID, parentID, commitName, commitMessage);
    await project.updateBranchCommitID(branch, commitID);

    await context.sync();

    return commitID;
}


export async function runCommit(name, message, branch) {
    return await runOperation(commit, name, message, branch);
}