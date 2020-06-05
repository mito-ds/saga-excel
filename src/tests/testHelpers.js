import Project from "../saga/Project";
import { addUpdateToProject } from "../saga/sync";
import * as multiplayer from "./scenarios/multiplayer";
import { runReplaceFromBase64 } from "../saga/create";


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


export class MultiplayerScenario {

    constructor(scenarioName) {
        // First, check that such a scenario exists
        if (!(scenarioName in multiplayer)) {
            console.error(`Error: no multiplayer scenario ${scenarioName} exists`);
            return null;
        }

        this.scenarioName = scenarioName;
        this.scenario = multiplayer[scenarioName];
        this.currStep = 0;
    }

    async start() {
        console.log("Starting");
        await runReplaceFromBase64(this.scenario.fileContents);
    }

    async nextSyncStep() {
        console.log(`In scenario ${this.scenarioName}, on step ${this.currStep}`);

        await Excel.run(async (context) => {
            const project = new Project(context);
            const syncStep = this.scenario.syncSteps[this.currStep];
            const headCommitID = await project.getCommitIDFromBranch("master");
            await addUpdateToProject(
                context, 
                headCommitID, 
                syncStep.fileContents, 
                syncStep.commitIDs, 
                syncStep.commitSheets
            );
        });

        this.currStep++;
    }
}