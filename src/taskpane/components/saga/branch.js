import { updateMetadataItem } from "./sagaUtils";
import Project from "./Project";


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