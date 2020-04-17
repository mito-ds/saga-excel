import { updateMetadataItem } from "./sagaUtils";
import Project from "./Project";
import {checkoutBranch} from "./checkout"


/* global Excel, Office, OfficeExtension */

/*
Display Dialog box to request user to name personal branch
*/
async function showUnamedPersonalBranchDialog() {
    var branchName = new Promise(function (resolve) {
        Office.context.ui.displayDialogAsync('/src/taskpane/components/UnamedPersonalBranchDialog.html', {height:40,width:40}, function(result) {
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
async function showPermissionDeniedDialog() {
    await Office.context.ui.displayDialogAsync('/src/taskpane/components/LockedPersonalBranchDialog.html', {height:40,width:40}, function(result) {
        const dialog = result.value;

        if (result.status == Office.AsyncResultStatus.Failed) {
            console.log('error');
        }

        dialog.addEventHandler(Office.EventType.DialogMessageReceived, function(responseMessage) {
            dialog.close();
        });

    }); 
}

export async function getCurrentBranchNameFromRibbon() {
    return new Promise(async function (resolve) {
      try {
        await Excel.run(async context => {
          const project = await new Project(context)
          const headBranch = await project.getHeadBranch()
          await resolve(headBranch)
        });
       } catch (error) {
          console.error(error);
          if (error instanceof OfficeExtension.Error) {
              console.error(error.debugInfo);
          }
      }
    });
  }

/*
Validate Commit Attempt: checks if user has permission to commit to branch
*/
export async function checkBranchPermission(context, branch) {
    const project = new Project(context);

    // Get the name of the personal branch of the committing user
    const personalBranchName = await project.getPersonalBranchName()

    // If they have not yet set the personal branch name
    if (personalBranchName === "") {
        // Show dialog box promting user for personal branch name
        const personalBranchName = await showUnamedPersonalBranchDialog()
        await project.updatePersonalBranchName(personalBranchName);
        await createBranch(context, personalBranchName);
        await checkoutBranch(context, personalBranchName);
        return false;
    }

    if (!branch) {
        branch = await project.getHeadBranch();
    }

    // Ensure user has permission to commit to branch
    /* COMMENTED DUE TO https://github.com/saga-vcs/saga-excel/issues/7
    if (personalBranchName !== branch) {
        console.log("you do not have permission to commit to this branch")
        await showPermissionDeniedDialog()
        return false;
    } */

    return true;
}


export async function createBranch(context, branch) {
    const project = new Project(context);

    // Don't create a branch if it already exists
    const branchExists = await project.checkBranchExists(branch);

    if (branchExists) {
        console.error(`Branch ${branch} already exists.`);
        return;
    }

    const branchRange = await project.getBranchRangeWithValues();

    // Add the new branch entry
    const headBranch = await project.getHeadBranch();
    const commitID = await project.getCommitIDFromBranch(headBranch);
    const newBranchRange = await project.insertRowBelowRange(branchRange, [[branch, commitID]]);
    await updateMetadataItem(context, 'branches', newBranchRange);
    
    return;
} 


export async function runCreateBranch(branch) {
  try {
    await Excel.run(async context => {
        await createBranch(context, branch);
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
    }
  }
}