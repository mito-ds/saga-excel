import { commit } from './commit';
import { getSheetsWithNames, getRandomID, getFormulas, deleteNonsagaSheets, getCommitSheets } from "./sagaUtils";
import { simpleMerge2D } from "./mergeUtils";
import { updateShared } from "./sync";
import { checkoutCommitID } from "./checkout";
import Project from "./Project";
import { runOperation, runOperationHandleError } from './runOperation';
import { makeClique } from "./commit";
import { mergeState, branchState } from '../constants';

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

// Resolve merge conflicts by updating the given cells with their given values
async function resolveMergeConflicts(context, resolutions) {
    const worksheets = context.workbook.worksheets;

    const sheetsResolutionsArray = Object.entries(resolutions);
    
    for (var i=0; i < sheetsResolutionsArray.length; i++) {

        // Get the personal version of the worksheet
        const sheetName = sheetsResolutionsArray[i][0]
        const personalWorksheet = worksheets.getItem(sheetName);

        // Get the master version of the worksheet
        const project = new Project(context);
        const headCommit = await project.getCommitIDFromBranch("master");
        const masterWorksheetName = "saga-" + headCommit + "-" + sheetName
        const masterWorksheet = worksheets.getItem(masterWorksheetName)

        const resolutions = sheetsResolutionsArray[i][1]
        
        for (var j = 0; j < resolutions.length; j++) {
            const cell = resolutions[j].cellOrRow
            const value = resolutions[j].value

            // Set cell value on personal Branch
            const cellRangePersonal = personalWorksheet.getRange(cell);
            cellRangePersonal.values = [[value]];
            await context.sync();
            
            // Set cell value on master Branch
            const cellRangeMaster = masterWorksheet.getRange(cell);
            console.log(`Resolving ${cell} to ${value}`)
            cellRangeMaster.values = [[value]];
            await context.sync();
        } 
    }

    await commit(context, "resolved merge conflicts", "resolved merge conflicts", "master")

    return {status: mergeState.MERGE_SUCCESS, conflicts: null};
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
    if (data.length === 0 || (data.length === 1 && data[0].length === 0)) {
        console.log(`No data to write to sheet ${sheetName}, returning`);
        return;
    }

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

function replaceReferencesInData(data, srcString, dstString) {
    data.forEach(row => {
        for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            if (typeof(cell) === `string` && cell.startsWith("=")) {
                row[i] = row[i].replaceAll(srcString, dstString);
            }
        }
    })
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

    const masterSheets = await getCommitSheets(sheets, masterCommitID);
    const personalSheets = getNonsagaSheets(sheets);
    const originSheets = await getCommitSheets(sheets, originCommitID);

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

        1. Create clique with the personal sheets we need to merge over to their new commit names.
        2. Merge the this newly renamed personal sheet with the current master and origin commits, and save them in memory
            - Because we renamed the personal sheets, they will have references to the correct sheets (e.g. new commit name - sheet)
        4. Then, we delete all the personal sheet with these commit names.
        5. Then, we copy over the master sheets with the new commit name, and write the data to these sheets.
        6. Finially, we update these sheets with the correct formatting values.
    */

    const personalSheetsNames = personalSheets.map(sheet => sheet.name);
    const insertedSheetsNames = insertedSheets.map(sheet => sheet.name);

    console.log("Personal:", personalSheetsNames);
    console.log("Personal renamed:", personalSheetsNames.map((sheetName) => {return newCommitPrefix + sheetName}));

    await makeClique(
        context,
        personalSheetsNames,
        (sheetName) => {return newCommitPrefix + sheetName},
        Excel.WorksheetPositionType.end,
        Excel.SheetVisibility.hidden // TODO: change to very hidden, figure out deleting
    )

    console.log("Copied over personal sheets to ", newCommitPrefix);

    const renamedPersonalSheets = personalSheetsNames.map((sheetName) => {return newCommitPrefix + sheetName});
    var mergedData = [];
    console.log("Renamed personal sheets", renamedPersonalSheets);
    for (let i = 0; i < renamedPersonalSheets.length; i++) {
        const personalSheetName = personalSheetsNames[i];
        const renamedPersonalSheetName = renamedPersonalSheets[i];
        const masterSheetName = masterPrefix + personalSheetName;
        const originSheetName = originPrefix + personalSheetName;

        // If the sheet is inserted, it's an easy merge
        if (insertedSheetsNames.includes(personalSheetName)) {
            const personalFormulas = await getFormulas(context, renamedPersonalSheetName);
            mergedData.push({
                sheet: personalSheetName,
                result: personalFormulas,
                conflicts: []
            });
            continue;
        }

        // TODO: do the same as above but for deleted

        /*
            We get the formulas from the renamed personal sheet, because they have the correct names
            and so the correct references
        */
        console.log(`For sheet ${personalSheetName}, getting formulas`);
        // TODO: handle the case where a sheet has been inserted (maybe deleted too)!
        const personalFormulas = await getFormulas(context, renamedPersonalSheetName);
        var masterFormulas = await getFormulas(context, masterSheetName);
        // We then replace all references to the master commit w/ the origin commit, so we don't have
        // merge conflicts that aren't really conflicts
        replaceReferencesInData(masterFormulas, masterCommitID, originCommitID);
        const originFormulas = await getFormulas(context, originSheetName);

        // Merge the formulas
        const mergeFormulas = simpleMerge2D(originFormulas, masterFormulas, personalFormulas, personalSheetName);

        // And save them
        mergedData.push(mergeFormulas);
    }

    console.log("Saved merged data", mergedData);
    console.log("Renamed personal sheets", renamedPersonalSheets);

    // Then, we delete all the renamed personal sheets, b/c we want to copy the master so we get their formatting
    for (let i = 0; i < renamedPersonalSheets.length; i++) {
        const sheet = context.workbook.worksheets.getItem(renamedPersonalSheets[i]);
        sheet.delete();

        if (i % 40 === 0 || i === renamedPersonalSheets.length - 1) {
            await context.sync()
        }
    }

    console.log("Deleted renamed personal sheets");

    // Now, we copy over master sheets, to get their formatting
    const masterNonDeletedNames = masterSheets.filter(sheet => {
        return !deletedSheets.some(deleted => deleted.name === sheet.name)
    }).map(sheet => sheet.name);

    await makeClique(
        context,
        masterNonDeletedNames,
        (sheetName) => {return newCommitPrefix + sheetName.split(masterPrefix)[1]},
        Excel.WorksheetPositionType.end,
        Excel.SheetVisibility.hidden // TODO: change to very hidden, figure out deleting
    )

    console.log(`Copied over the master non-deleted sheets:`, masterNonDeletedNames);

    // As well as all the inserted sheets
    await makeClique(
        context,
        insertedSheetsNames,
        (sheetName) => {return newCommitPrefix + sheetName},
        Excel.WorksheetPositionType.end,
        Excel.SheetVisibility.hidden // TODO: change to very hidden, figure out deleting
    )

    console.log("Copied over inserted", insertedSheetsNames);
    
    console.log(mergedData)
    mergedData.forEach(async function(sheetMergeResult) {
        // TODO: we have to not copy over the sheets that were deleted on master
        console.log(sheetMergeResult)
        console.log("Trying to write to ", sheetMergeResult.sheet, "with", sheetMergeResult.result);
        await writeDataToSheet(context, newCommitPrefix + sheetMergeResult.sheet, sheetMergeResult.result);
    })

    console.log("Wrote data to all sheets");

    // Then, we propagate over the formatting events
    var formattingEventsMap = {};
    formattingEvents.forEach(event => {
        if (!(event.worksheetId in formattingEventsMap)) {
            formattingEventsMap[event.worksheetId] = [];
        }
        formattingEventsMap[event.worksheetId].push(event);
    })

    for (let i = 0; i < mergeSheets.length; i++) {
        const personalSheetName = mergeSheets[i].name;
        const mergeSheetName = newCommitPrefix + personalSheetName;
        await copyFormatting(context, personalPrefix + personalSheetName, mergeSheetName, formattingEventsMap);
    }

    console.log("Done with formatting")

    // We make a tmp sheet (so we can delete things)
    var tmpSheet = personalSheets[0];
    tmpSheet.name = "saga-tmp";

    // Finially, we have to delete the old personal sheets
    await deleteNonsagaSheets(context);

    console.log("Deleted non-saga sheets")
    

    // And then copy all the sheets on that merge back to the personal branch
    const newCommitSheets = (await getSheetsWithNames(context)).map(sheet => sheet.name).filter(sheetName => sheetName.startsWith(newCommitPrefix));
    await makeClique(
        context,
        newCommitSheets,
        (sheetName) => {return sheetName.split(newCommitPrefix)[1]},
        Excel.WorksheetPositionType.beginning,
        Excel.SheetVisibility.visible // TODO: change to very hidden, figure out deleting
    )

    // Then we delete the tmp sheet
    tmpSheet.delete();
    console.log("Copied new commit sheets to personal branch", newCommitSheets);


    // And then we update the commits and stuff in the proper places
    await project.updateBranchCommitID(`master`, newCommitID);
    await project.updateBranchCommitID(personalBranch, newCommitID); // we commit on both of these branches
    await project.addCommitID(newCommitID, masterCommitID, `Merged in ${personalBranch}`, "");

    // And we update the last commit you caught up till
    await project.setLastCatchUpCommitID(newCommitID);

    return mergedData;
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

    if (updated !== branchState.BRANCH_STATE_HEAD) {
        return updated === branchState.BRANCH_STATE_FORKED ? {status: mergeState.MERGE_FORKED, mergeConflictData: null} : {status: mergeState.MERGE_ERROR, mergeConflictData: null};
    }

    const project = new Project(context);
    const personalBranchRange = await project.getPersonalBranchNameWithValues();
    const personalBranch = personalBranchRange.values[0][0];
    const headBranch = await project.getHeadBranch();

    if (headBranch !== personalBranch) {
        console.error("Please check out your personal branch before checking in.");
        return {status: mergeState.MERGE_ERROR, mergeConflictData: null};
    }

    // Make a commit on the personal branch    
    await commit(context, `check in of ${personalBranch}`, "", personalBranch);

    // Merge this commit into the shared branch
    const mergeData = await doMerge(context, formattingEvents);

    // Try and update the server with this newly merged sheets
    const updatedWithMerge = await updateShared(context);

    if (updatedWithMerge !== branchState.BRANCH_STATE_HEAD) {
        return updatedWithMerge === branchState.BRANCH_STATE_FORKED ? {status: mergeState.MERGE_FORKED, mergeConflictData: null} : {status: mergeState.MERGE_ERROR, mergeConflictData: null};
    }

    // Check for merge conflicts
    const mergedSheets = Object.entries(mergeData);
    let mergeConflict = false
    mergedSheets.forEach((sheet) => {
        if (sheet[1].conflicts.length !== 0) {
            mergeConflict = true
        }
    });

    return mergeConflict ? {status: mergeState.MERGE_CONFLICT, mergeConflictData: mergeData} : {status: mergeState.MERGE_SUCCESS, mergeConflictData: null};
}

/*
    If there is an error during the execution of a merge, we hope it is after
    the check in of the personal branch, and try to roll back to that commit. 

    If that fails, we give up... TODO?
*/
function makeHandleMergeError(previousPersonalCommitID) {
    const handleMergeError = async (error) => {
        try {
            await Excel.run(async (context) => {
                const project = new Project(context);
                const personalBranch = await project.getPersonalBranch();
                const personalHeadCommit = await project.getCommitIDFromBranch(personalBranch);

                /*
                    If we got to the checkin of personal, (which is the first thing to occur in the merge)
                    then we can roll back to it. 

                    Otherwise, if there isn't a new commit on personal, then we must have not have deleted
                    any of the sheets, and so we don't need to do anything.
                */
                if (previousPersonalCommitID !== personalHeadCommit) {
                    await checkoutCommitID(context, personalHeadCommit);
                }
            });
            return {status: mergeState.MERGE_ERROR, mergeConflictData: null};;
        } catch (error) {
            // TODO: we should change so it returns a "critical error here"
    
            console.log(error);
        }
        return {status: mergeState.MERGE_ERROR, mergeConflictData: null};
    }
}



export async function runMerge(formattingEvents) {
    const previousPersonalCommitID = await runOperation(async (context) => {
        const project = new Project(context);
        const personalBranch = await project.getPersonalBranch();
        return await project.getCommitIDFromBranch(personalBranch);
    });
    const handleMergeError = makeHandleMergeError(previousPersonalCommitID);
    return runOperationHandleError(merge, handleMergeError, formattingEvents);
}

export async function runResolveMergeConflicts(resolutions) {
    return runOperation(resolveMergeConflicts, resolutions)
}