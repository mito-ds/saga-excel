import { turnSyncOff, turnSyncOn } from "./sync";

/* global Excel, OfficeExtension */

export async function runOperation(operation, ...rest) {
    console.log("RUNNING");
    console.log(rest);
    turnSyncOff();
    try {
        await Excel.run(async context => {
            await operation(context, ...rest);
        });
    } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }
    turnSyncOn();
}