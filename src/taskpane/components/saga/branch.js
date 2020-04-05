import { getHeadBranch, getCommitIDFromBranch, getBranchRangeWithValues, insertRowBelowRange } from './commit';
import { updateMetadataItem } from "./sagaUtils";

export async function checkBranchExists(context, branch) {
    const branchRange = await getBranchRangeWithValues(context);
    return branchRange.values.some(row => row[0] === branch);

}

export async function createBranch(context, branch) {
    // Don't create a branch if it already exists
    const branchExists = await checkBranchExists(context, branch);
    if (branchExists) {
        console.error(`Branch ${branch} already exists.`);
        return;
    }
    const branchRange = await getBranchRangeWithValues(context);

    // Add the new branch entry
    const headBranch = await getHeadBranch(context);
    const commitID = await getCommitIDFromBranch(context, headBranch);

    const newBranchRange = await insertRowBelowRange(context, branchRange, [[branch, commitID]]);

    await updateMetadataItem(context, 'branches', newBranchRange);
    
    return;
} 