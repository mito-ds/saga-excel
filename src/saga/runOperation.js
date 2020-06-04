import { turnSyncOff, turnSyncOn } from "./sync";
import { commit } from "./commit";
import Project from "./Project";
import { operationStatus } from '../constants';
import { checkoutCommitID, checkoutBranch } from "./checkout";


/* global Excel, OfficeExtension */

export async function runOperation(operation, ...rest) {
    turnSyncOff();
    var result;
    try {
        await Excel.run(async context => {
            result = await operation(context, ...rest);
        });
    } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
        result = false;
    }
    turnSyncOn();
    return result;
}

export async function runOperationHandleError(operation, errorHandler, ...rest) {
    turnSyncOff();
    var result;
    try {
        await Excel.run(async context => {
            result = await operation(context, ...rest);
        });
    } catch (error) {
        result = await errorHandler(error);
    }
    turnSyncOn();
    return result;
}


export async function runOperationNoSync(operation, ...rest) {
    turnSyncOff();
    var result;
    try {
        await Excel.run(async context => {
            result = await operation(context, ...rest);
        });
    } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
        result = false;
    }
    return result;
}

export async function runOperationHandleErrorNoSync(operation, errorHandler, ...rest) {
    turnSyncOff();
    var result;
    try {
        await Excel.run(async context => {
            result = await operation(context, ...rest);
        });
    } catch (error) {
        result = await errorHandler(error);
    }
    return result;
}

export async function runOperationSafetyCommit(operation, ...rest) {
    turnSyncOff();
    var result;
    var safetyCommit;
    try {
        await Excel.run(async context => {
            const project = new Project(context);
            const currentBranch = await project.getHeadBranch();

            // if current branch is master, save master commit as safety commit
            if (currentBranch === "master") {
                safetyCommit = await project.getCommitIDFromBranch("master");
                
            } else {
                // if personal branch is checked out, make a safety commit
                const personalBranchName = await project.getPersonalBranch();
                safetyCommit = await commit(context, `safety commit`, `comitting before running operation`, personalBranchName);
            }

            // run operation
            const operationResult = await operation(context, ...rest);
            result = {status: operationStatus.SUCCESS, operationResult: operationResult}; 
        });
    } catch (error) {
        
        console.log(error);

        // If the error pauses execution, so that a manual rollback is required
        if (error.debugInfo.code === "InvalidOperationInCellEditMode") {
            console.log("error is cell editting mode");
            result = {status: operationStatus.ERROR_MANUAL_FIX, safetyCommit: safetyCommit};
        } else {
            console.log("here");
            // If none of the above errors occured, we should be able to revert to safety commit
            await Excel.run(async context => {
                console.log(`checking out safety commit ${safetyCommit}`);
                const project = new Project(context);

                // Checkout personal branch if not already checked out
                const branch = await project.getHeadBranch();
                const personalBranchName = await project.getPersonalBranch();
                console.log(branch);
                if (branch !== personalBranchName) {
                    await checkoutBranch(context, personalBranchName);
                }

                // revert to safety commit
                await checkoutCommitID(safetyCommit);

                // return after automatically fixing
                result = {status: operationStatus.ERROR_AUTOMATICALLY_FIXED};
            });
        }
    }
    turnSyncOn();
    return result;
}