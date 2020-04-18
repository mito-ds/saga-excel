import { getSheetsWithNames, copySheets, getRandomID } from "./sagaUtils";
import { getFileContents } from "./fileUtils";
import { checkBranchPermission } from "./branch";
import Project from "./Project";
import { runOperation } from "./runOperation";

/* global Excel */

async function makeClique(context, sheetNames, getNewName, worksheetPositionType, worksheetVisibility) {
    const fileContents = await getFileContents();
    const worksheets = context.workbook.worksheets;
  
    var sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {return sheetNames.includes(sheet.name)});
  
    // Rename all the sheets
    for (let i = 0; i < sheets.length; i++) {
      const newName = getNewName(sheets[i].name);
      sheets[i].name = newName;
  
      if (i % 40 === 0) {
        await context.sync();
      }
    }
  
    // Then, reinsert all the sheets
    worksheets.addFromBase64(
      fileContents,
      sheetNames,
      worksheetPositionType
    );
  
    // Now, for each of these sheets, we set their visibility
    // TODO
}
  
  
export function runMakeClique() {
    runOperation(makeClique, ["Sheet1", "Sheet2"], (name) => {return name + "-COMMIT"}, Excel.WorksheetPositionType.end);
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
    makeClique(
        context, 
        sheetNames, 
        (name) => {return `saga-${commitID}-${name}`}, 
        Excel.WorksheetPositionType.beginning, 
        null // TODO: add worksheet visibility
    );

    // save the commit id with it's parent
    const parentID = await project.getCommitIDFromBranch(branch);
    await project.updateBranchCommitID(branch, commitID);
    await project.addCommitID(commitID, parentID, commitName, commitMessage);

    return context.sync();
}

async function commitIfPermission(context, name, message) {
    const userPermission = await checkBranchPermission(context);
    if (userPermission) {
        await commit(context, name, message);
    } else {
        console.error("Cannot commit as user does not have permission on this branch");
    }
}



export async function runCommit(name, message) {
    await runOperation(commitIfPermission, name, message);
}