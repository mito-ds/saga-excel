import { turnSyncOff, turnSyncOn } from "./sync";
import { commit } from "./commit";
import Project from "./Project";
import { operationStatus } from '../constants';
import { checkoutCommitID } from "./checkout";


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
            const personalBranchName = await project.getPersonalBranch();
            safetyCommit = await commit(context, `safety commit`, `comitting before running ${operation}`, personalBranchName);
            const operationResult = await operation(context, ...rest);
            result = {status: operationStatus.SUCCESS, operationResult: operationResult};
        });
    } catch (error) {
        console.error(error);

        // print information about the error
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }

        // If the error pauses execution, so that a manual roll back is required
        if (error.debugInfo.code === "InvalidOperationInCellEditMode") {
            console.log("error is cell editting mode");
            return {status: operationStatus.ERROR_MANUAL_FIX, safetyCommit: safetyCommit};
        }
        
        // If we can automatically rollback
        await checkoutCommitID(safetyCommit);
    
        // return after automatically fixing
        return {status: operationStatus.ERROR_AUTOMATICALLY_FIXED};
    }
    turnSyncOn();
    return result;
}