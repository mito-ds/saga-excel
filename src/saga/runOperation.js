import { pauseSync, resumeSync } from "./sync";
import { commit } from "./commit";
import Project from "./Project";
import { operationStatus } from '../constants';
import { revertToCommitAndBranch } from "./sagaUtils";

/* global Excel, OfficeExtension */

export async function runOperation(operation, ...rest) {
    pauseSync();
    var result;
    try {
        await Excel.run(async context => {
            const operationResult = await operation(context, ...rest);
            result = {status: operationStatus.SUCCESS, operationResult: operationResult}; 

        });
    } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
        result = {status: operationStatus.ERROR_AUTOMATICALLY_FIXED}; 
    }
    // we only turn sync on if it was on originally
    resumeSync();
    return result;
}

export async function runOperationHandleError(operation, errorHandler, ...rest) {
    pauseSync();
    var result;
    try {
        await Excel.run(async context => {
            const operationResult = await operation(context, ...rest);
            result = {status: operationStatus.SUCCESS, operationResult: operationResult}; 
        });
    } catch (error) {
        const operationResult = await errorHandler(error);
        result = {status: operationStatus.ERROR_AUTOMATICALLY_FIXED, operationResult: operationResult}; 
    }
    resumeSync();
    return result;
}


export async function runOperationNoSync(operation, ...rest) {
    pauseSync();
    var result;
    try {
        await Excel.run(async context => {
            const operationResult = await operation(context, ...rest);
            result = {status: operationStatus.SUCCESS, operationResult: operationResult}; 
        });
    } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
        result = {status: operationStatus.ERROR_AUTOMATICALLY_FIXED}; 
    }
    return result;
}

export async function runOperationSafetyCommit(operation, ...rest) {
    console.log("pausing sync");
    pauseSync();
    console.log("done pausing sync");
    var result;
    var safetyCommit;
    var safetyBranch;
    try {
        await Excel.run(async context => {
            const project = new Project(context);
            const currentBranch = await project.getHeadBranch();

            // if current branch is master, save master commit as safety commit
            if (currentBranch === "master") {
                safetyCommit = await project.getCommitIDFromBranch("master");
                safetyBranch = "master";
                
            } else {
                // if personal branch is checked out, make a safety commit
                const personalBranchName = await project.getPersonalBranch();
                safetyCommit = await commit(context, `safety commit`, `comitting before running operation`, personalBranchName);
                safetyBranch = personalBranchName;
            }

            // run operation
            console.log("running operation");
            const operationResult = await operation(context, ...rest);
            console.log("result");
            result = {status: operationStatus.SUCCESS, operationResult: operationResult}; 
        });
    } catch (error) {
        console.log(error);

        // if the error requires manual resolution
        if (error.debugInfo !== undefined && error.debugInfo.code === "InvalidOperationInCellEditMode") {
            result = {status: operationStatus.ERROR_MANUAL_FIX, safetyCommit: safetyCommit, safetyBranch: safetyBranch};
        } else {
            // If none of the above errors occured, we should be able to revert to safety commit
            await Excel.run(async context => {

                await revertToCommitAndBranch(context, safetyCommit, safetyBranch);

                // return after automatically fixing
                result = {status: operationStatus.ERROR_AUTOMATICALLY_FIXED};
            });
        }
    }
    resumeSync();
    return result;
}