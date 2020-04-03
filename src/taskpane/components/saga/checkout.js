import { getSheetsWithNames, copySheet } from "./sagaUtils";
import { checkBranchExists } from "./branch";
/*
Gets the commit ID for a given branch name, 
returns null? if the branch does not exist, 
and "" if the branch has no previous commits on it
*/
async function getCommitIDFromBranch(context, branch) {
    // find the instance of the branch in the saga sheet
    // return null if it doesn't exist (maybe "") works too
    const worksheet = context.workbook.worksheets.getItem("saga");
    let searchRange = worksheet.getRange("C1:C10"); // TODO: name this object!
    // TODO: don't just get B10 you fool!!!! This will be a bug once more than 10 branches!
    let foundRange = searchRange.find(branch, {
        completeMatch: true, // find will match the whole cell value
        matchCase: false, // find will not match case
    });
    // TODO: handle case where branch doesn't exist!
    foundRange.load("address")
    await context.sync();
    const commitRangeAddress = "C" + foundRange.address.split("saga!B")[1];
    const commitRange = worksheet.getRange(commitRangeAddress);
    commitRange.load("values");
    await context.sync();
    const commitID = commitRange.values[0][0];
    return commitID;
}

async function deleteNonsagaSheets(context) {
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })

    sheets.forEach(sheet => sheet.delete());

    await context.sync();
}

/*
Creates a new commit on the given branch
*/
export async function checkoutBranch(context, branch) {
    // TODO: don't let ppl check out if there are changed sheets!

    // Only let people checkout branches that exist
    const branchExists = await checkBranchExists(context, branch);
    if (!branchExists) {
        console.error(`Cannot checkout ${branch} as it does not exist.`);
        return;
    }

    // Find the commit for a branch
    const commitID = await getCommitIDFromBranch(context, branch);

    // Find those sheets that we should copy back
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}-`)
    })

    // Delete the non-saga sheets
    await deleteNonsagaSheets(context);

    // Copy back the sheets
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

    // Finially, update the head branch
    const sheet = context.workbook.worksheets.getItem("saga");
    const range = sheet.getRange("A2");
    range.values = [[branch]];

    return context.sync();
}