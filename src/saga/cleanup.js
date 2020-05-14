import { turnSyncOff } from "./sync";
import { getSheetsWithNames } from "./sagaUtils";

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

    await safeSyncLoop(
        context,
        sheets,
        (sheet) => {
            if (sheet.name.startsWith(`saga`)) {
                sheet.delete();
            }
        }
    )

    // TODO: we need to rename to Sheet1, and clear itn

    // Then, we rename the current sheet to Sheet1, and clear it


    
    return true;
}


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
