import { updateMetadataItem } from "./sagaUtils";
import Project from "./Project";


/* global Excel, OfficeExtension */

/*
Validate Commit Attempt: checks if user has permission to commit to branch
*/
export async function checkBranchPermission(context, branch) {
    // TODO: for now we just give them permission
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