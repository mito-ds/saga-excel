import { getSheetsWithNames, deleteNonsagaSheets } from "./sagaUtils";
import Project from './Project';
import { runOperation } from "./runOperation";
import { makeClique } from "./commit"

/* global Excel */


export async function switchVersionFromRibbon(context) {
    const project = new Project(context);

    // Get current branch
    const currentBranch = await project.getHeadBranch();

    // Switch Branches
    if (currentBranch === 'master') {
        const personalBranchName = await project.getPersonalBranchName();
        await checkoutBranch(context, personalBranchName);
    } else {
        await checkoutBranch(context, "master");
        // If master, lock sheets
        await lockWorksheets(context)
    }
}


async function getNonSagaSheets(context) {
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })
    return sheets;
}

/* 
Lock worksheets
*/
async function lockWorksheets(context) {
    const sheets = await getNonSagaSheets(context);

    await Promise.all(sheets.map(async (sheet) => {
        sheet.load("protection/protected")
        await context.sync()
        //Todo: Add password to protect
        sheet.protection.protect()
        await context.sync()
    }));
}

/*
    TODO: If this is called with a non-existant commit id, who knows what it will do!
*/
export async function checkoutCommitID(context, commitID) {
    // Find those sheets that we should copy back
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}-`)
    })

    const srcWorksheets = sheets.map(sheet => sheet.name);

    // Delete the non-saga sheets
    const tmpSheet = (await getSheetsWithNames(context)).find(sheet => !sheet.name.startsWith("saga"))
    tmpSheet.name = "saga-tmp";
    await deleteNonsagaSheets(context);

    // Checkout the sheet data in the correct location
    await makeClique(
        context, 
        srcWorksheets, 
        (sheetName) => sheetName.split(`saga-${commitID}-`)[1], 
        Excel.WorksheetPositionType.beginning, 
        Excel.SheetVisibility.visible
    );
    tmpSheet.delete();
}


/*
Creates a new commit on the given branch
*/
export async function checkoutBranch(context, branch) {
    const project = new Project(context);

    // Only let people checkout branches that exist
    const branchExists = await project.checkBranchExists(branch);
    if (!branchExists) {
        console.error(`Cannot checkout ${branch} as it does not exist.`);
        return;
    }

    /* Turning off committing before checking out. Warning: This will cause data loss
    // Make commit on current branch to stop data loss
    // TODO only make this commit if changes have occured since last commit
    const currentBranch = await project.getHeadBranch();
    await commit(context, "Automatic checkout commit", `Switching from ${currentBranch} to ${branch}`, currentBranch)
    */
   

    // Find the commit for a branch
    const commitID = await project.getCommitIDFromBranch(branch);

    await checkoutCommitID(context, commitID);

    // Finially, update the head branch
    const headRange = await project.getHeadRange();
    headRange.values = [[branch]];

    await context.sync();
}

export async function runCheckoutBranch(branch) {
    await runOperation(checkoutBranch, branch);
}

export async function runSwitchVersionFromRibbon() {
    await runOperation(switchVersionFromRibbon)
}