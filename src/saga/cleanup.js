import { turnSyncOff } from "./sync";
import { getSheetsWithNames, createSheet } from "./sagaUtils";

/* global Excel, OfficeExtension */

/*
    Applies a single operation to all items in the array, but respects
    the JavaScript Excel APIs ability to handle at most 50 queued transactions
*/
async function safeSyncLoop(context, arr, operation) {

    for (let i = 0; i < arr.length; i++) {
        operation(arr[i]);

        // we can queue up at 50 transactions at once, so we sync at 40 to be safe
        if (i % 40 === 0) {
            await context.sync();
        }
    }

    return context.sync();
}



/*
    Removes all saga sheets from the project, and further deletes any scheduled processes
*/
async function cleanup(context) {
    const sheets = await getSheetsWithNames(context);

    await safeSyncLoop(context, sheets.slice(1), (sheet) => {sheet.delete()})
    sheets[0].name = "saga-tmp";
    await createSheet(context, "Sheet1", Excel.SheetVisibility.visible);
    sheets[0].delete();

    await context.sync();
    return true;
}

/*
    Leaves just an empty Sheet1, and further deletes any scheduled processes
*/
export async function runCleanup() {

    turnSyncOff();
    var result;
    try {
        await Excel.run(async context => {
            // Save the active sheet
            // TODO: write this in a promise to make run operation return things
            result = await cleanup(context);
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
