import { turnSyncOff, turnSyncOn } from "./sync";


/* global Excel, OfficeExtension */

export async function runOperation(operation, ...rest) {
    turnSyncOff();
    var result;
    try {
        await Excel.run(async context => {
            // Save the active sheet
            // TODO: write this in a promise to make run operation return things
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
