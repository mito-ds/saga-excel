import { getSheetsWithNames, copySheet, getRandomID } from "./sagaUtils";
import Project from "./Project";
import { createBranch } from "./branch";
import { checkoutBranch } from "./checkout";

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
Display Dialog box to request user to name personal branch
*/
async function showUnamedPersonalBranchDialog(project, url) {
    var branchName = new Promise(function (resolve, reject) {
        Office.context.ui.displayDialogAsync(url, {height:40,width:40}, function(result) {
            const dialog = result.value;
    
            if (result.status == Office.AsyncResultStatus.Failed) {
                console.log('error in unamed personal branch dialog');
            }
    
            dialog.addEventHandler(Office.EventType.DialogMessageReceived, function(responseMessage) {
                branchName = responseMessage.message
                resolve(branchName)
                dialog.close();
            });
        }); 
    }) 
    return branchName 
}

/*
Display Dialog box to inform user they are not on their personal branch
*/
async function showPermissionDeniedDialog(project, url) {
    await Office.context.ui.displayDialogAsync(url, {height:40,width:40}, function(result){
        const dialog = result.value;

        if (result.status == Office.AsyncResultStatus.Failed) {
            console.log('error');
        }

        dialog.addEventHandler(Office.EventType.DialogMessageReceived, function(responseMessage){
            dialog.close();
        });

    }); 
}

/*
Creates a new commit on the given branch
*/
export async function commit(context, commitName, commitMessage, branch, commitID) {
    const project = new Project(context);

    // Get the name of the personal branch of the committing user
    const personalBranchNameRange = await project.getPersonalBranchNameWithValues();
    const personalBranchName = personalBranchNameRange.values[0][0];

    // If they have not yet set the personal branch name
    if (personalBranchName == "") {
        // Show dialog box promting user for personal branch name
        const personalBranchName = await showUnamedPersonalBranchDialog(project, '/src/taskpane/components/UnamedPersonalBranchDialog.html')
        await project.updatePersonalBranchName(personalBranchName);
        await createBranch(context, personalBranchName);
        await checkoutBranch(context, personalBranchName);
        return;
    }

    if (!branch) {
        branch = await project.getHeadBranch();
    }

    // Ensure user has permission to commit to branch
    /* COMMENTED DUE TO https://github.com/saga-vcs/saga-excel/issues/7
    if (personalBranchName !== branch) {
        console.log("you do not have permission to commit to this branch")
        await showPermissionDeniedDialog(project, '/src/taskpane/components/LockedPersonalBranchDialog.html')
        return;
    } */

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
    await saveSheets(context, sheetNames, commitID);

    // save the commit id with it's parent
    const parentID = await project.getCommitIDFromBranch(branch);
    await project.updateBranchCommitID(branch, commitID);
    await project.addCommitID(commitID, parentID, commitName, commitMessage);

    return context.sync();
}
