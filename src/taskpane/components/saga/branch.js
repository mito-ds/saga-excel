import { getHeadBranch, getCommitIDFromBranch } from './commit';

async function getNewBranchRangeAddress(context) {
    const worksheet = context.workbook.worksheets.getItem("saga");
    const range = worksheet.getUsedRange();
    range.load('rowCount');
    await context.sync();
    const rowCount = range.rowCount;
    return "B" + (rowCount + 1) + ":C" + (rowCount + 1);
}

export async function checkBranchExists(context, branch) {
    const worksheet = context.workbook.worksheets.getItem("saga");
    var searchRange = worksheet.getRange("C1:C10"); // TODO: name this object!
    // If we name it we can keep track of the number of objects
    // TODO: don't just get B10 you fool!!!! This will be a bug once more than 10 branches!
    var foundRange = searchRange.findOrNullObject(branch, {
        completeMatch: true, // find will match the whole cell value
        matchCase: true, // find will not match case
    });

    foundRange.load('isNull');
    await context.sync();

    if (!foundRange.isNull) {
        return true;
    }
    return false;
}

export async function createBranch(context, branch) {
    // Don't create the branch if it already exists
    const branchExists = await checkBranchExists(context, branch);
    if (branchExists) {
        console.error(`Branch ${branch} already exists.`);
        return;
    }

    const newBranchRangeAddress = await getNewBranchRangeAddress(context);
    const worksheet = context.workbook.worksheets.getItem("saga");
    const range = worksheet.getRange(newBranchRangeAddress);
    const headBranch = await getHeadBranch(context);
    const commitID = await getCommitIDFromBranch(context, headBranch);
    
    range.values = [[branch, commitID]];
    return context.sync();
} 