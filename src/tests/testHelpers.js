
import Project from "../saga/Project";
import { addUpdateToProject } from "../saga/sync";

/* global Excel */

export async function getItemRangeValues(context, itemName) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const storedItem = worksheet.names.getItem(itemName);
    storedItem.load(`value`);
    await context.sync();
    const range = worksheet.getRange(storedItem.value);
    range.load("values");
    await context.sync();
    return range.values;
}

export async function getValues(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("values");
    await context.sync();
    return range.values;
}

export async function getFormulas(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("formulas");
    await context.sync();
    return range.formulas;
}


export async function nextSyncStep(scenario) {

    // We add it to the file
    await Excel.run(async (context) => {
        const project = new Project(context);
        const remoteURL = await project.getRemoteURL();
        const remoteSplit = remoteURL.split("/");
        const currStep = parseInt(remoteSplit[2]);

        console.log("On step", currStep);

        const syncStep = scenario.syncSteps[currStep];

        const headCommitID = await project.getCommitIDFromBranch("master");

        await addUpdateToProject(
            context, 
            headCommitID, 
            syncStep.fileContents, 
            syncStep.commitIDs, 
            syncStep.commitSheets
        );

        
        const nextURL = `${remoteSplit.slice(0, 2).join("/")}/${currStep + 1}`;
        await project.setRemoteURL(nextURL);
    });
}