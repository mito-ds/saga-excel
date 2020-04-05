import { getSheetsWithNames, copySheet, getRandomID, updateMetadataItem } from "./sagaUtils";


// Inserts a single row directly below range (which must be same # of cols as range)
// Returns the new range including these values
export async function insertRowBelowRange(context, range, values) {
    
    // Make sure row count and address are defined
    range.load("rowCount");
    range.load("address");
    await context.sync();

    // TODO: handle cases where "!" or ":" is in the sheet name 
    const [sheetName, address] = range.address.split(`!`)
    const [addTopRight, addBotLeft] = address.split(`:`)
    const topRightCol = addTopRight.match(`[A-Z]+`)[0];
    const topRightRow = addTopRight.match(`[0-9]+`)[0];
    const botLeftCol = addBotLeft.match(`[A-Z]+`)[0];
    const botLeftRow = addBotLeft.match(`[0-9]+`)[0];

    const worksheet = context.workbook.worksheets.getItem(sheetName);

    // Now, we actually insert the column
    const nextRow = parseInt(botLeftRow) + 1;
    const rowInsertAddress = `${sheetName}!${topRightCol}${nextRow}:${botLeftCol}${nextRow}`;
    const rowInsertRange = worksheet.getRange(rowInsertAddress);
    rowInsertRange.values = values;

    // We then return a new range that represents the old range union new row
    
    const newRangeAddress = `${sheetName}!${topRightCol}${topRightRow}:${botLeftCol}${nextRow}`;
    const newRange = worksheet.getRange(newRangeAddress);

    await context.sync();

    return newRange;
}

async function getBranchRange(context) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const branchItem = worksheet.names.getItem(`branches`);
    branchItem.load(`value`);
    await context.sync();
    return worksheet.getRange(branchItem.value);
}


export async function getBranchRangeWithValues(context) {
    const branchRange = await getBranchRange(context);
    branchRange.load("values");
    await context.sync();
    return branchRange;
}

export async function getHeadRange(context) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const headItem = worksheet.names.getItem(`HEAD`);
    headItem.load(`value`);
    await context.sync();
    // Uh, i dont' know why, but have to call this twice sometimes???
    // TODO: figure out why, lol
    headItem.load(`value`);
    await context.sync();

    console.log(headItem);
    return worksheet.getRange(headItem.value);
}

async function getHeadRangeWithValues(context) {
    const headRange = await getHeadRange(context);
    headRange.load("values");
    await context.sync();
    console.log(headRange);
    return headRange;
}

async function getCommitRange(context) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const commitItem = worksheet.names.getItem(`commits`);
    commitItem.load(`value`);
    await context.sync();
    return worksheet.getRange(commitItem.value);
}

export async function getCommitRangeWithValues(context) {
    const commitRange = await getCommitRange(context);
    commitRange.load("values");
    commitRange.load("address");
    commitRange.load("rowCount")
    await context.sync();
    console.log(commitRange);
    return commitRange;
}

/*
Gets the commit ID for a given branch name, 
returns null? if the branch does not exist, 
and "" if the branch has no previous commits on it
*/
export async function getCommitIDFromBranch(context, branch) {
    const branchRange = await getBranchRangeWithValues(context);
    
    const row = branchRange.values.find(row => {
        return row[0] === branch;
    })

    if (!row) {
        return null;
    }
    return row[1];
}

/*
Returns the branch in the HEAD variable
*/
export async function getHeadBranch(context) {
    const headRange = await getHeadRangeWithValues(context);
    return headRange.values[0][0];
}


/*
Returns the branch in the HEAD variable
*/
async function addCommitID(context, commitID, parentID) {
    const commitRange = await getCommitRangeWithValues(context);

    // Insert the values into the sheet
    const newRange = await insertRowBelowRange(context, commitRange, [[commitID, parentID]]);

    await updateMetadataItem(context, `commits`, newRange);
}

/*
Returns the branch in the HEAD variable
*/
async function updateBranchCommitID(context, branch, commitID) {
    const branchRange = await getBranchRangeWithValues(context);

    const newBranches = branchRange.values.map(row => {
        if (row[0] === branch) {
            return [branch, commitID];
        }
        return row;
    })

    branchRange.values = newBranches;

    return context.sync();
}

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
Creates a new commit on the given branch
*/
export async function commit(context, branch) {
    if (!branch) {
        branch = await getHeadBranch(context);
    }

    console.log(`making a commit on branch ${branch}`)

    // Create a new commit ID
    const commitID = getRandomID();

    // Find the names of all the sheets we have to copy to this commit
    const sheets = (await getSheetsWithNames(context)).filter((sheet) => {
        return !sheet.name.startsWith("saga");
    });

    const sheetNames = sheets.map(sheet => sheet.name);
    
    // backup the sheet data
    await saveSheets(context, sheetNames, commitID);

    // save the commit id with it's parent
    const parentID = await getCommitIDFromBranch(context, branch);
    await updateBranchCommitID(context, branch, commitID);
    await addCommitID(context, commitID, parentID);

    return context.sync();
}