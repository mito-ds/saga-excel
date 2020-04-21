import { getSheetsWithNames, getRandomID } from "./sagaUtils";
import { getFileContents } from "./fileUtils";
import { checkBranchPermission } from "./branch";
import Project from "./Project";
import { runOperation } from "./runOperation";

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

    // Then, we go through and rename all the newly inserted sheets, as well as set their visibility
    // We need to find what their names are, which, for now, we assume will just be renamed + a (1)
    for (let i = 0; i < sheetNames.length; i++) {
        // TODO: handle more complex renamings or inserts
        const insertedName = sheetNames[i] + " (2)";
        const newName = getNewName(sheetNames[i]);
        console.log(`Getting sheet ${insertedName} and changing ${newName}`)
        const sheet = worksheets.getItem(insertedName);
        sheet.name = newName;
        sheet.visibility = worksheetVisibility;
        console.log("Setting worksheet visibility to", worksheetVisibility)

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

    console.log(`making a commit on branch ${branch}`)

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
        (name) => {return `saga-${commitID}-${name}`}, 
        Excel.WorksheetPositionType.end, 
        Excel.SheetVisibility.visible
    );

    // save the commit id with it's parent
    const parentID = await project.getCommitIDFromBranch(branch);
    await project.updateBranchCommitID(branch, commitID);
    await project.addCommitID(commitID, parentID, commitName, commitMessage);

    await context.sync();

    // Return the new commit ID!
    return commitID;
}

async function commitIfPermission(context, name, message) {
    const userPermission = await checkBranchPermission(context);
    if (userPermission) {
        return await commit(context, name, message);
    } else {
        console.error("Cannot commit as user does not have permission on this branch");
    }
}



export async function runCommit(name, message) {
    return await runOperation(commitIfPermission, name, message);
}