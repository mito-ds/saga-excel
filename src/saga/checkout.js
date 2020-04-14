import { getSheetsWithNames, copySheet } from "./sagaUtils";
import Project from './Project';
import { runOperation } from "./runOperation";
import {commit} from './commit';

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
        await runCheckoutBranch(personalBranchName);
    } else {
        await runCheckoutBranch('master');
    }

    console.log("5")

}


export async function deleteNonsagaSheets(context) {
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
    const project = new Project(context);

    // Only let people checkout branches that exist
    const branchExists = await project.checkBranchExists(branch);
    if (!branchExists) {
        console.error(`Cannot checkout ${branch} as it does not exist.`);
        return;
    }

    // Make commit on current branch to stop data loss
    // TODO only make this commit if changes have occured since last commit
    const currentBranch = await project.getHeadBranch();
    await commit(context, "Automatic checkout commit", `Switching from ${currentBranch} to ${branch}`, currentBranch)

    // Find the commit for a branch
    const commitID = await project.getCommitIDFromBranch(branch);

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