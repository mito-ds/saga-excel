import { commit } from './commit';
import { copySheet, getRandomID, getFormulas } from "./sagaUtils";
import { diff3Merge2d } from "./mergeUtils";
import { updateShared } from "./sync";
import Project from "./Project";

/* global Excel */

/**
 * Takes a positive integer and returns the corresponding column name.
 * @param {number} num  The positive integer to convert to a column name.
 * @return {string}  The column name.
 */
function toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
}
// Taken from https://cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name/


const getCommitSheets = (sheets, commitID) => {
    return sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}`);
    })
}

const doMerge = async (context) => {
    const project = new Project(context);

    const personalBranchRange = await project.getPersonalBranchNameWithValues();
    const personalBranch = personalBranchRange.values[0][0];

    if (personalBranch === ``) {
        console.error(`Cannot checkin personal branch as it does not exist.`);
        return;
    }

    const masterCommitID = await project.getCommitIDFromBranch(`master`);
    const personalCommitID = await project.getCommitIDFromBranch(personalBranch);

    // Because we don't have commits, the least common ancestor is always 
    // the parent of the personal commit ID
    const originCommitID = await project.getParentCommitID(personalCommitID);

    const sheets = await project.getSheetsWithNames();

    const masterSheets = getCommitSheets(sheets, masterCommitID);
    const personalSheets = getCommitSheets(sheets, personalCommitID);
    const originSheets = getCommitSheets(sheets, originCommitID);

    // Helper function for figuring out what sorta sheet this is
    function checkExistance(branchSheet) {
        const masterName = branchSheet.name.replace(personalCommitID, masterCommitID);
        const originName = branchSheet.name.replace(personalCommitID, originCommitID);

        const inMaster = (masterSheets.find(s => {return s.name === masterName;}) !== undefined);
        const inOrigin = (originSheets.find(s => {return s.name === originName;}) !== undefined);

        return {inMaster: inMaster, inOrigin: inOrigin};
    }

    // We can copy over sheets that are inserted into the branch, 
    // But were also not removed from the origin
    const insertedSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return !ex.inMaster && !ex.inOrigin;
    })

    // Sheets that have been added in both the head branch and the 
    // merged branch, and so we have a conflict
    const conflictSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return ex.inMaster && !ex.inOrigin;
    })

    // Sheets that have been removed from the head branch, but where in the origin branch
    /*
    const deletedSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return !ex.inMaster && ex.inOrigin;
    })
    */

    // Now, we actually need to merge the sheets 
    const mergeSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return ex.inMaster && ex.inOrigin;
    })

    if (conflictSheets.length > 0) {
        conflictSheets.forEach(sheet => {
            console.error(`Merge conflict on ${sheet.name}`);
        })
        return;
    }

    const newCommitID = getRandomID();
    const newCommitPrefix = `saga-${newCommitID}`;

    function getName(sheet) {
        return sheet.name.split(`-`)[2];
    }

    // Copy over the inserted sheets
    for (let i = 0; i < insertedSheets.length; i++) {
        // TODO: we might wanna do this at the end!
        // TODO: we can probably track sheet renames with sheet ID!
        const sheet = insertedSheets[i];
        const dst = `${newCommitPrefix}-${getName(sheet)}`;
        await copySheet(
            context, 
            sheet.name,
            dst,
            Excel.WorksheetPositionType.end,
            Excel.SheetVisibility.visible
        );
    }

    for (let i = 0; i < mergeSheets.length; i++) {
        // First, we copy all the merge sheets to a new destination
        const sheet = mergeSheets[i];

        const personalSheetName = sheet.name;
        const masterSheetName = personalSheetName.replace(personalCommitID, masterCommitID);
        const originSheetname = personalSheetName.replace(personalCommitID, originCommitID);

        const personalFormulas = await getFormulas(context, personalSheetName);
        const masterFormulas = await getFormulas(context, masterSheetName);
        const originFormulas = await getFormulas(context, originSheetname);

        // Merge the formulas
        const mergeFormulas = diff3Merge2d(personalFormulas, masterFormulas, originFormulas);

        const mergeDst = `${newCommitPrefix}-${getName(sheet)}`;
        console.log(`In merge, copying ${personalSheetName} to ${mergeDst}`)
        await copySheet(
            context, 
            personalSheetName,
            mergeDst,
            Excel.WorksheetPositionType.end,
            Excel.SheetVisibility.visible
        );

        const mergeSheet = context.workbook.worksheets.getItem(mergeDst);
        for (let i = 0; i < mergeFormulas.length; i++) {
            const len = mergeFormulas[i].length;
            const endColumn = toColumnName(len);
            const rangeAddress = `A${i + 1}:${endColumn}${i+1}`;
            const rowRange = mergeSheet.getRange(rangeAddress);
            rowRange.values = [mergeFormulas[i]];
        }
        await context.sync();
    }

    // Finially, after we have merged everything, we can log the commit to lock it in
    await project.updateBranchCommitID(`master`, newCommitID);
    await project.addCommitID(newCommitID, masterCommitID, `Merged in ${personalBranch}`, "");
}

/*
Checking in is when a user merges their personal branch into the master branch.
When this occurs, their merged changes are propagated to all other team members
of this saga project. 

As such, we first try to ensure that the user is caught up with the front of the
remote master branch. If they are not, we try and sync them. If they can't sync, 
we refuse to checkin (as this might lead to a fork).
*/
export async function checkin(context) {

    const updated = await updateShared(context);

    if (!updated) {
        console.error("Cannot checkin personal branch as shared branch may not be up to date.");
        return;
    }

    const project = new Project(context);
    const personalBranchRange = await project.getPersonalBranchNameWithValues();
    const personalBranch = personalBranchRange.values[0][0];
    const headBranch = await project.getHeadBranch();

    if (headBranch !== personalBranch) {
        console.error("Please check out your personal branch before checking in.");
        return;
    }

    // Make a commit on the personal branch    
    await commit(context, `check in of ${personalBranch}`, "", personalBranch);
    // Merge this commit into the shared branch
    await doMerge(context);

    // Try and update the server with this newly merged sheets
    const updatedWithMerge = await updateShared(context);

    if (!updatedWithMerge) {
        console.error("Checked in data may have not been been shared...");
        // TODO: handle this case with some better UI...
    }
}

export async function runCheckin() {
    try {
      await Excel.run(async context => {
          await checkin(context);
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
          console.error(error.debugInfo);
      }
    }
  }