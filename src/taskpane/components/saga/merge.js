import { getHeadBranch, getCommitIDFromBranch } from './commit';
import { checkBranchExists } from './branch';
import { getSheetsWithNames, copySheet, getFormulas } from "./sagaUtils";
import { diff3Merge2d } from "./mergeUtils";


function buildGraph(values) {
    let graph = {}
    values.forEach(row => {
        graph[row[0]] = row[1];
    })
    return graph;
}


async function getOriginCommitID(context, branch1, branch2) {
    const sheet = context.workbook.worksheets.getItem("saga-commits");
    const branch1CommitID = await getCommitIDFromBranch(context, branch1);
    const branch2CommitID = await getCommitIDFromBranch(context, branch2);
    
    // Then, we read in all the commits
    const commitRange = sheet.getRange("A1:B10");
    commitRange.load("values");
    await context.sync();
    const graph = buildGraph(commitRange.values);

    let reached = {'': true};
    let curr = branch1CommitID;
    while (curr !== '') {
        reached[curr] = true;
        curr = graph[curr];
    }

    curr = branch2CommitID;
    while (!reached[curr]) {
        curr = graph[curr];
    }
    return curr;
}

/**
 * Takes a positive integer and returns the corresponding column name.
 * @param {number} num  The positive integer to convert to a column name.
 * @return {string}  The column name.
 */
function toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
}
// Taken from https://cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name/



export async function mergeBranch(context, branch) {
    // Get the head branch
    const headBranch = await getHeadBranch(context);
    // Check that this branch exists
    const branchExists = await checkBranchExists(context, branch);
    if (!branchExists) {
        console.error(`Cannot merge ${branch} as it does not exist`);
        return;
    }
    const branchCommitID = await getCommitIDFromBranch(context, branch);

    // Get the sheets from both branch
    const sheets = await getSheetsWithNames(context);
    const headSheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })
    const branchSheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${branchCommitID}`);
    })

    // We feel free to copy over any sheets that have a different name!
    const toCopy = branchSheets.filter(sheet => {
        for (let i = 0; i < headSheets.length; i++) {
            const oldName = sheet.name.split(`saga-${branchCommitID}-`)[1];
            if (oldName === headSheets[i].name) {
                return false;
            }
        }
        return true;
    })

    for (let i = 0; i < toCopy.length; i++) {
        // TODO: we might wanna do this at the end!
        // TODO: we can probably track sheet renames with sheet ID!
        const dst = sheet.name.split(`saga-${branchCommitID}-`)[1];
        await copySheet(
            context, 
            sheet.name, 
            dst, 
            Excel.WorksheetPositionType.beginning,
            Excel.SheetVisibility.visible
        );
    }

    // Now, we actually need to merge the sheets 
    const toMerge = branchSheets.filter(sheet => {
        for (let i = 0; i < headSheets.length; i++) {
            const oldName = sheet.name.split(`saga-${branchCommitID}-`)[1];
            if (oldName === headSheets[i].name) {
                return true;
            }
        }
        return false;
    })

    // TODO: get origin from two branches
    const originCommitID = await getOriginCommitID(context, headBranch, branch);
    const originSheetNameBase = `saga-${originCommitID}-`


    for (let i = 0; i < toMerge.length; i++) {
        const sheet = toMerge[i];
        const oldName = sheet.name.split(`saga-${branchCommitID}-`)[1];
        console.log(`Merging sheet ${oldName}`);
        const originSheetName = originSheetNameBase + oldName;
        console.log(`Origin sheet ${originSheetName}`);
        const originFormulas = await getFormulas(context, originSheetName);
        const headFormulas = await getFormulas(context, oldName);
        const branchFormulas = await getFormulas(context, sheet.name);
        const merge = diff3Merge2d(originFormulas, headFormulas, branchFormulas);
        // Finially, we get the range
        const mergeSheet = context.workbook.worksheets.getItem(oldName);

        for (let i = 0; i < merge.length; i++) {
            const len = merge[i].length;
            const endColumn = toColumnName(len);
            const rangeAddress = `A${i + 1}:${endColumn}${i+1}`;
            console.log(`DATA: ${merge[i]}, ADDRESS: ${rangeAddress}`);
            const rowRange = mergeSheet.getRange(rangeAddress);
            rowRange.values = [merge[i]];
        }
        context.sync();
    }
}