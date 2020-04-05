
/*

export default class Project {
    constructor(context) {
        this.context = context;
    }


    getCommitIDFromBranch = (branch) => {
        // find the instance of the branch in the saga sheet
        // return null if it doesn't exist (maybe "") works too
        const worksheet = context.workbook.worksheets.getItem("saga");
        var searchRange = worksheet.getRange("C1:C10"); // TODO: name this object!
        // TODO: don't just get B10 you fool!!!! This will be a bug once more than 10 branches!
        var foundRange = searchRange.find(branch, {
            completeMatch: true, // find will match the whole cell value
            matchCase: false, // find will not match case
        });
        // TODO: handle case where branch doesn't exist!
        foundRange.load("address")
        await context.sync();
        const commitRangeAddress = "C" + foundRange.address.split("saga!C")[1];
        const commitRange = worksheet.getRange(commitRangeAddress);
        commitRange.load("values");
        await context.sync();
        const commitID = commitRange.values[0][0];
        return commitID;
    }

*/

