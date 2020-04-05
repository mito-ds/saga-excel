import { getSheetsWithNames, copySheet, deleteNonsagaSheets } from "./sagaUtils";
import Project from "./Project";


/*
Restores the state of a given commit to the active state
*/
export async function restoreCommit(context, commitID) {
    const project = new Project(context);

    // Check if CommitID Exists
    const commitIDExists = project.checkCommitIDExists(commitID);
    if (!commitIDExists) {
        return;
    }

    // Get all sheets with their names
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return sheet.name.startsWith("saga-" + commitID);
    })

    // Delete Non Saga Sheets
    await deleteNonsagaSheets(context)

    // Make Commited Sheet Visible
    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const newName = sheet.name.split(`saga-${commitID}-`)[1];
        await copySheet(
            context, 
            sheet.name, 
            newName, 
            Excel.WorksheetPositionType.beginning, //TODO: we have to store og location
            Excel.SheetVisibility.visible
        );
    }
    return;

}
