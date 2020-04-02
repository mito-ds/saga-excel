import { getHeadBranch, getCommitIDFromBranch, commit } from './commit';
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

// TODO: make sure this function is only called on commit sheets!
function getOriginName(sheet) {
    // TODO: make sure sheet.name is defined!
    if (!sheet.name.startsWith(`saga`)) {
        return sheet.name;
    } 

    return sheet.name.split(`-`)[2];
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

    // Get the origin commit id for these two branches
    const originCommitID = await getOriginCommitID(context, headBranch, branch);
    const originSheetNameBase = `saga-${originCommitID}-`

    // Get the sheets from both branch
    const sheets = await getSheetsWithNames(context);
    const headSheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })
    const branchSheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${branchCommitID}`);
    })
    const originSheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${originCommitID}`);
    })

    // Helper function for figuring out what sorta sheet this is
    function checkExistance(branchSheet) {
        const oldName = getOriginName(branchSheet);
        const inHead = (headSheets.find(s => {return s.name === oldName;}) !== undefined);
        const inOrigin = (originSheets.find(s => {
            return oldName === getOriginName(s);
        }) !== undefined);

        return {inHead: inHead, inOrigin: inOrigin};
    }

    // We can copy over sheets that are inserted into the branch, 
    // But were also not removed from the origin
    const insertedSheets = branchSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return !ex.inHead && !ex.inOrigin;
    })

    // Sheets that have been added in both the head branch and the 
    // merged branch, and so we have a conflict
    const conflictSheets = branchSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return ex.inHead && !ex.inOrigin;
    })

    // Sheets that have been removed from the head branch, but where in the origin branch
    const deletedSheets = branchSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return !ex.inHead && ex.inOrigin;
    })

    // Now, we actually need to merge the sheets 
    const mergeSheets = branchSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return ex.inHead && ex.inOrigin;
    })

    if (conflictSheets.length > 0) {
        conflictSheets.forEach(sheet => {
            console.error(`Merge conflict on ${sheet.name}`);
        })
        return;
    }

    // Now, we actually perform the copying and the merging


    // Copy over the 
    for (let i = 0; i < insertedSheets.length; i++) {
        // TODO: we might wanna do this at the end!
        // TODO: we can probably track sheet renames with sheet ID!
        const sheet = insertedSheets[i];
        const dst = getOriginName(sheet);
        await copySheet(
            context, 
            sheet.name,
            dst,
            Excel.WorksheetPositionType.beginning,
            Excel.SheetVisibility.visible
        );
    }

    for (let i = 0; i < mergeSheets.length; i++) {
        // TODO: optimize
        const sheet = mergeSheets[i];
        const originName = getOriginName(sheet);
        const originSheetName = originSheetNameBase + originName;

        console.log(`getting formulas for:`, originSheetName)
        const originFormulas = await getFormulas(context, originSheetName);
        console.log(`getting formulas for:`, originName)
        const headFormulas = await getFormulas(context, originName);
        console.log(`getting formulas for:`, sheet.name)
        const branchFormulas = await getFormulas(context, sheet.name);
        console.log("GOT FORMULAS")
        const merge = diff3Merge2d(originFormulas, headFormulas, branchFormulas);

        // Finially, we get the range
        const mergeSheet = context.workbook.worksheets.getItem(originName);

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

    // Finially, after we have merged everything, we can make a commit to lock it in
    await commit(context);
}