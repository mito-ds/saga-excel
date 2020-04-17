import { turnSyncOff, turnSyncOn } from "./sync";


/* global Excel, OfficeExtension */

export async function runOperation(operation, ...rest) {
    turnSyncOff();
    try {
        await Excel.run(async context => {
            // Save the active sheet
            var activeSheet = context.workbook.worksheets.getActiveWorksheet();
            await operation(context, ...rest);

            // restore the active sheet at the end of the operation
            activeSheet.activate();
            await context.sync();
        });
    } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }
    turnSyncOn();
}