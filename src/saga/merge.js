import { commit } from './commit';
import { copySheets, getSheetsWithNames, getRandomID, getFormulas } from "./sagaUtils";
import { diff3Merge2d } from "./mergeUtils";
import { updateShared } from "./sync";
import Project from "./Project";
import { runOperation } from './runOperation';
import { makeClique } from "./commit";

/* global Excel */

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


const getCommitSheets = (sheets, commitID) => {
    return sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}`);
    })
}

const getNonsagaSheets = (sheets) => {
    return sheets.filter(sheet => {
        return !sheet.name.startsWith(`saga`);
    })
}

async function findOtherSheetReferencesAddr(context, sheetName, nonSagaSheets) {
    // In a given non-saga sheet, will return an array of all the addresses of the
    // cells that contain a reference to another non-saga sheet

    const worksheet = context.workbook.worksheets.getItem(sheetName);

    /*
    1. Get all sheet names
    */
    var found = []
    for (let i = 0; i < nonSagaSheets.length; i++) {
        console.log(`Looking for =${nonSagaSheets[i].name}`)
        var foundRanges = worksheet.findAllOrNullObject(`=${nonSagaSheets[i].name}`, {
            completeMatch: false, // findAll will match the whole cell value
            matchCase: false // findAll will not match case
        });
        await context.sync();

        if (foundRanges.isNullObject) {
            console.log("No ranges contain this");
        } else {
            foundRanges.load("address");
            await context.sync()
            console.log(foundRanges.address)
            found.push(...foundRanges.address.split(","));
        }
    }

    return found;
}

async function updateReferences(context, sheetName, newCommitPrefix) {

    const worksheet = context.workbook.worksheets.getItem(sheetName);

    const nonSagaSheets = (await getSheetsWithNames(context)).filter(sheet => {return !sheet.name.startsWith("saga")});
    const nonSagaSheetNames = nonSagaSheets.map(sheet => sheet.name);
    const otherSheetReferences = await findOtherSheetReferencesAddr(context, nonSagaSheets);

    // Loop over all of them, get the values, and 
    var mapping = {};
    for (let i = 0; i < otherSheetReferences.length; i++) {
        const refRange = worksheet.getRange(otherSheetReferences[i]);
        refRange.load("formulas");
        await context.sync();
            mapping[otherSheetReferences[i]] = refRange.formulas[0][0];
    }
    // TODO: fix this w/ a complicated algorithm so it works for when sheet names are substrings of eachother

    var newMapping = {}
    for (const addr in mapping) {
        const formula = mapping[addr];
        var newFormula = formula;
        for (let i = 0; i < nonSagaSheetNames.length; i++) {
            const sheetName = nonSagaSheetNames[i];
            const newSheetName = newCommitPrefix + nonSagaSheetNames[i];
            newFormula = newFormula.replace(sheetName, newSheetName);
        }
        newMapping[addr] = newFormula;
    }

    var count = 0;
    for (const addr in newMapping) {
        const newFormula = newMapping[addr];
        worksheet.getRange(addr).value = newFormula;

        count++;
        // We can have at most 40 transactions
        if (count % 40 === 0) {
            await context.sync();
        }
    }

    return newMapping;
}

async function writeDataToSheet(context, sheetName, data) {
    const sheet = context.workbook.worksheets.getItem(sheetName);

    // First, we make sure the data is a rectangle
    const maxLength = Math.max(...data.map(row => {return row.length}));    
    const rectData = data.map(row => {row.length = maxLength; return row});

    // Find the address of the rectangle range we're going to write
    const endColumn = toColumnName(maxLength);
    const rangeAddress = `A${1}:${endColumn}${rectData.length}`;

    // Finially, write the values
    sheet.getRange(rangeAddress).values = rectData;

    await context.sync();
}

async function copyFormatting(context, srcSheetName, dstSheetName, formattingEventsMap) {
    const srcFormatting = context.workbook.worksheets.getItem(srcSheetName);
    const dstFormatting = context.workbook.worksheets.getItem(dstSheetName);
    // We sync here to get the sheet IDs
    await context.sync();

    const sheetID = srcFormatting._I;
    const events = formattingEventsMap[sheetID] || []; 
    for (let i = 0; i < events.length; i++) {
        const address = events[i].address;
        dstFormatting.getRange(address).copyFrom(srcFormatting.getRange(address), Excel.RangeCopyType.formats);
        
        if (i % 40 === 0) {
            await context.sync();
        }
    }

    await context.sync();
}


const doMerge = async (context, formattingEvents) => {
    const project = new Project(context);

    if (formattingEvents == undefined) {
        formattingEvents = []
    }

    const personalBranchRange = await project.getPersonalBranchNameWithValues();
    const personalBranch = personalBranchRange.values[0][0];

    if (personalBranch === ``) {
        console.error(`Cannot checkin personal branch as it does not exist.`);
        return;
    }

    const masterCommitID = await project.getCommitIDFromBranch(`master`);
    const personalCommitID = await project.getCommitIDFromBranch(personalBranch);

    // Because we don't have commits, the least common ancestor is always 
    // the parent of the personal commit ID
    const originCommitID = await project.getParentCommitID(personalCommitID);

    console.log("masterCommitID", masterCommitID);
    console.log("personalCommitID", personalCommitID);
    console.log("originCommitID", originCommitID);
    
    const sheets = await project.getSheetsWithNames();

    const masterSheets = getCommitSheets(sheets, masterCommitID);
    const personalSheets = getNonsagaSheets(sheets);
    const originSheets = getCommitSheets(sheets, originCommitID);

    console.log("MASTER SHEETS", masterSheets);
    console.log("PERSONAL SHEETS", personalSheets);
    console.log("ORIGIN SHEETS", originSheets);

    const masterPrefix = `saga-${masterCommitID}-`;
    const personalPrefix = `saga-${personalCommitID}-`;
    const originPrefix = `saga-${originCommitID}-`;
    const newCommitID = getRandomID();
    const newCommitPrefix = `saga-${newCommitID}-`;


    // Helper function for figuring out what sorta sheet this is
    function checkExistance(branchSheet) {
        const masterName = masterPrefix + branchSheet.name;
        const originName = originPrefix + branchSheet.name;

        console.log(masterName, originName);

        const inMaster = (masterSheets.find(s => {return s.name === masterName;}) !== undefined);
        const inOrigin = (originSheets.find(s => {return s.name === originName;}) !== undefined);

        return {inMaster: inMaster, inOrigin: inOrigin};
    }

    // We can copy over sheets that are inserted into the branch, 
    // But were also not removed from the origin
    const insertedSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return !ex.inMaster && !ex.inOrigin;
    })

    // Sheets that have been added in both the head branch and the 
    // merged branch, and so we have a conflict
    const conflictSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return ex.inMaster && !ex.inOrigin;
    })

    // TODO: we should be merging conflict sheets together

    // Sheets that have been removed from the head branch, but where in the origin branch
    
    const deletedSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return !ex.inMaster && ex.inOrigin;
    })

    // Now, we actually need to merge the sheets 
    const mergeSheets = personalSheets.filter(sheet => {
        const ex = checkExistance(sheet);
        return ex.inMaster && ex.inOrigin;
    })

    if (conflictSheets.length > 0) {
        conflictSheets.forEach(sheet => {
            console.error(`Merge conflict on ${sheet.name}`);
        })
        return;
    }

    /*
        We have to make sure sheets all exist at the right time, so we do the following:

        1. We copy over all the master sheets (that haven't been deleted) to the new merge commit.
        2. Then, we make versions of all the inserted sheet on the new merge commit.
        3. We copy over the inserted sheets, making sure to replace references where they exist.
        4. We do the actual merging of sheets, making sure to take the right references when we do
    */


    // 1. Copy over all master sheets that haven't been deleted
    const masterNonDeletedNames = masterSheets.filter(sheet => {
        return !deletedSheets.some(deleted => deleted.name === sheet.name)
    }).map(sheet => sheet.name);

    await makeClique(
        context,
        masterNonDeletedNames,
        (sheetName) => {return newCommitPrefix + sheetName.split(masterPrefix)[1]},
        Excel.WorksheetPositionType.end,
        null
    )

    // 2. Copy over all the inserted sheets
    const insertedSheetsNames = insertedSheets.map(sheet => sheet.name);
    /*
        NOTE: we copy sheets here, rather than make clique, because we want to preserve the
        current values of the references, because we then go and switch them.
    */
    await copySheets(
        context,
        insertedSheetsNames,
        (sheetName) => {return newCommitPrefix + sheetName}, // they are the personal sheets
        Excel.WorksheetPositionType.end,
        null
    )

    // And make sure to fix the references
    for (let i = 0; i < insertedSheetsNames.length; i++) {
        const newSheetName = newCommitPrefix + insertedSheetsNames[i].name;
        await updateReferences(context, newSheetName, newCommitPrefix);
    }

    // Then, we do the actual merging of sheets

    // We sort the formatting events by ID
    var formattingEventsMap = {};
    formattingEvents.forEach(event => {
        if (!(event.worksheetId in formattingEventsMap)) {
            formattingEventsMap[event.worksheetId] = [];
        }
        formattingEventsMap[event.worksheetId].push(event);
    })

    for (let i = 0; i < mergeSheets.length; i++) {
        const sheet = mergeSheets[i];
        console.log("Merging", sheet.name);

        const personalSheetName = sheet.name;
        const masterSheetName = masterPrefix + personalSheetName;
        const originSheetName = originPrefix + personalSheetName;
        const mergeSheetName = newCommitPrefix + personalSheetName;

        const personalFormulas = await getFormulas(context, personalSheetName);
        const masterFormulas = await getFormulas(context, masterSheetName);
        const originFormulas = await getFormulas(context, originSheetName);

        // Merge the formulas
        const mergeFormulas = diff3Merge2d(originFormulas, masterFormulas, personalFormulas);

        console.log("Trying to write data to sheet");

        // Then, we write these formulas to the merge sheet
        await writeDataToSheet(context, mergeSheetName, mergeFormulas);

        console.log("Done writing data to sheet");

        // Then, we copy over the saved formatting to the merge sheet
        /*
            We then copy over the formatting events to the merge sheet.
            Note that the src sheet is the current commit sheet on the personal branch,
            as this is the original personal sheet, which was moved during the call to make clique
        */
        await copyFormatting(context, personalPrefix + personalSheetName, mergeSheetName, formattingEventsMap);

        // Then, we delete the sheet on the personal branch
        sheet.delete();

        await context.sync();
    }
    console.log("Done merging all sheets");


    // Finially, we have to copy all the merged sheets back over to the personal branch
    const sheetsMergedOntoNames = mergeSheets.map(sheet => newCommitPrefix + sheet.name);
    await makeClique(
        context,
        sheetsMergedOntoNames,
        (sheetName) => {return sheetName.split(newCommitPrefix)[1]},
        Excel.WorksheetPositionType.end,
        null
    )

    // And then we update the commits and stuff in the proper places
    await project.updateBranchCommitID(`master`, newCommitID);
    await project.updateBranchCommitID(personalBranch, newCommitID); // we commit on both of these branches
    await project.addCommitID(newCommitID, masterCommitID, `Merged in ${personalBranch}`, "");
}

/*
Merging in is when a user merges their personal branch into the master branch.
When this occurs, their merged changes are propagated to all other team members
of this saga project. 

As such, we first try to ensure that the user is caught up with the front of the
remote master branch. If they are not, we try and sync them. If they can't sync, 
we refuse to checkin (as this might lead to a fork).
*/
export async function merge(context, formattingEvents) {

    const updated = await updateShared(context);

    if (!updated) {
        console.error("Cannot checkin personal branch as shared branch may not be up to date.");
        return;
    }

    const project = new Project(context);
    const personalBranchRange = await project.getPersonalBranchNameWithValues();
    const personalBranch = personalBranchRange.values[0][0];
    const headBranch = await project.getHeadBranch();

    if (headBranch !== personalBranch) {
        console.error("Please check out your personal branch before checking in.");
        return;
    }

    // Make a commit on the personal branch    
    await commit(context, `check in of ${personalBranch}`, "", personalBranch);
    // Merge this commit into the shared branch
    await doMerge(context, formattingEvents);
    console.log("FINISHED DOING MERGE")

    // Try and update the server with this newly merged sheets
    const updatedWithMerge = await updateShared(context);

    if (!updatedWithMerge) {
        console.error("Checked in data may have not been been shared...");
        // TODO: handle this case with some better UI...
    }
}

export async function runMerge(formattingEvents) {
    await runOperation(merge, formattingEvents);
}