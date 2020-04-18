import { getSheetsWithNames, copySheet, copySheets } from "./sagaUtils";
import Project from './Project';
import { runOperation } from "./runOperation";
import { makeClique } from "./commit"

/* global Excel */


export async function switchVersionFromRibbon(context) {
    console.log("1")

    const project = await new Project(context);

    console.log("2")

    // Get current branch
    const currentBranch = await project.getHeadBranch();

    console.log("3")
    console.log(currentBranch)

    // Switch Branches
    if (currentBranch === 'master') {
        const personalBranchName = await project.getPersonalBranchName();
        await checkoutBranch(context, personalBranchName);
    } else {
        await checkoutBranch(context, "master");
    }

    console.log("5")

}


async function getNonSagaSheets(context) {
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })
    return sheets;
}

/* 
Deletes all sheets that do not start with 'saga'
*/
export async function deleteNonsagaSheets(context) {
    const sheets = await getNonSagaSheets(context);
    sheets.forEach(sheet => sheet.delete());

    await context.sync();
}

/* 
Lock worksheets
*/
async function lockWorksheets(context) {
    const sheets = await getNonSagaSheets(context)
    await Promise.all(sheets.map(async (sheet) => {
        await sheet.load("protection/protected")
        await context.sync()
        //Todo: Add password to protect
        await sheet.protection.protect()
        await context.sync()
    }));
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

    console.log(`got commit id ${commitID}`)

    // Find those sheets that we should copy back
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}-`)
    })

    console.log(`got sheets ${sheets}`)


    const srcWorksheets = sheets.map(sheet => sheet.name);

    console.log(`got srcWorksheets ${srcWorksheets}`)


    // Delete the non-saga sheets
    await deleteNonsagaSheets(context);

    console.log("detelted non saga sheets")

    // backup the sheet data
    makeClique(
        context, 
        srcWorksheets, 
        (sheetName) => sheetName.split(`saga-${commitID}-`)[1], 
        Excel.WorksheetPositionType.beginning, 
        null // TODO: add worksheet visibility
    );

    console.log("made clique")


    // If master, lock sheets
    if (branch === 'master') {
        lockWorksheets(context)
    }

    // Finially, update the head branch
    const headRange = await project.getHeadRange();
    headRange.values = [[branch]];

    console.log("update head branch")


    await context.sync();
}

export async function runCheckoutBranch(branch) {
    await runOperation(checkoutBranch, branch);
}

export async function runSwitchVersionFromRibbon() {
    await runOperation(switchVersionFromRibbon)
}