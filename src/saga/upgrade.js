import { runOperation } from "./runOperation";
import { item } from "../constants";
import * as scenarios from "../../scenarios";
import { replaceFromBase64 } from "./create";
import { getFileContents } from "./fileUtils";
/*
    This function takes a current saga project and runs an upgrade function against it.
*/

async function upgrade(context) {
    const sagaSheet = context.workbook.worksheets.getItem("saga");
    
    //Setup, name range for the version
    const versionRange = sagaSheet.getRange("A5");
    sagaSheet.names.add(item.VERSION, versionRange);
    versionRange.values = [["0.0.1"]];

    await context.sync();
}


/*
    For now, we have some super simple upgrade scripts.
*/

async function upgradeAllScenarios(context) {
    // We get the saga sheet

    const scenarioNames = Object.keys(scenarios);

    const newScenarios = [];
    for (let i = 0; i < scenarioNames.length; i++) {
        const scenarioName = scenarioNames[i];
        const scenarioJSON = scenarios[scenarioName];

        // First, we load the scenario
        await replaceFromBase64(context, scenarioJSON.fileContents);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Then, we run the upgrade function 
        try {
            await upgrade(context);
        } catch (e) {
            console.log(`ERROR ON SCENARIO ${scenarioName}`);
        }

        // Then we save the new scenario object
        const newFileContents = await getFileContents();
        newScenarios.push({
            scenarioName: scenarioName,
            fileContents: newFileContents
        })
    }

    newScenarios.forEach(newScenario => console.log(JSON.stringify(newScenario)));
}

export function runUpgradeAllScenarios() {
    runOperation(upgradeAllScenarios);
}