import { getSheetsWithNames, copySheet, deleteNonsagaSheets } from "./sagaUtils";
import Project from "./Project";
import { checkoutBranch } from "./checkout";
import { runOperation } from "./runOperation";
import { commit } from "./commit";

/* global Excel */

/*
Saves a copy off all current non-saga sheets.
If the sheet is named 'data', it will be saved at 
'saga-{commitID}-data'
*/

async function copySheetsToPersonalVersion(context, sheetOriginalLocation, sheetDesitnationLocation) {
    // TODO: could be done in parallel! we don't need to sync context during, hopefully.


    return context.sync();
}

/*
Create Commit
*/
export async function resetPersonalVersion(context) {
    const project = new Project(context);

    // Checkout personal branch if not already checked out
    const branch = await project.getHeadBranch()
    const personalBranchName = await project.getPersonalBranchName();
    if (branch !== personalBranchName) {
        await checkoutBranch(context, personalBranchName)
    }
    
    // Get commitID of master's head commit
    const masterCommitID = await project.getCommitIDFromBranch('master')
    console.log(masterCommitID)

    // Find the sheets on master
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        console.log(sheet.name.startsWith(`saga-${masterCommitID}-`))
        return sheet.name.startsWith(`saga-${masterCommitID}-`);
    })

    //Remove all non saga sheets from personal branch
    await deleteNonsagaSheets(context)

    // Copy Sheets to Personal Version
    const sheetLocations = await sheets.map(sheet => [sheet.name, sheet.name.split(`saga-${masterCommitID}-`)[1]]);
    console.log(sheetLocations)
    for (var i = 0; i < sheetLocations.length; i++) {
        await copySheet(
            context, 
            sheetLocations[i][0], 
            sheetLocations[i][1], 
            Excel.WorksheetPositionType.beginning,
            Excel.SheetVisibility.visible
        );
    }

    //Commit to personal branch
    await commit(context, "Automatic reset commit", `Reset personal branch from ${masterCommitID}`);
    return context.sync();
}


export async function runResetPersonalVersion() {
    await runOperation(resetPersonalVersion);
}
