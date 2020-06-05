import Project from "./Project";
import { checkoutBranch } from "./checkout";
import { runOperation } from "./runOperation";
import { commit } from "./commit";
import { checkoutCommitID } from "./checkout";

/* global */

/*
 Reset the personal version to the current version of master
*/
export async function resetPersonalVersion(context) {
    const project = new Project(context);

    // Checkout personal branch if not already checked out
    const branch = await project.getHeadBranch();
    const personalBranchName = await project.getPersonalBranch();
    if (branch !== personalBranchName) {
        await checkoutBranch(context, personalBranchName);
    }
        
    // Get commitID of master's head commit
    const masterCommitID = await project.getCommitIDFromBranch('master');
    await checkoutCommitID(context, masterCommitID);

    // Update the last checked out value
    await project.setLastCatchUpCommitID(masterCommitID);

    // Commit to personal branch
    await commit(context, "Automatic reset commit", `Reset personal branch from ${masterCommitID}`, personalBranchName);
    return context.sync();
}


export async function runResetPersonalVersion() {
    await runOperation(resetPersonalVersion);
}
