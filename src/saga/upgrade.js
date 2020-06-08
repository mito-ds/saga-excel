import { runOperation } from "./runOperation";
import { TEST_URL } from "../constants";
import * as scenarios from "../tests/scenarios";
import { getFileContents } from "./fileUtils";
import Project from "./Project";
/*
    This function takes a current saga project and runs an upgrade function against it.
*/

async function upgrade(context) {
    const project = new Project(context);

    const remoteURL = await project.getRemoteURL();

    if (remoteURL !== TEST_URL) {
        // if the remote URL isn't the test URL, we update it
        await project.setRemoteURL(TEST_URL);
        return true;
    }

    return false; 
}


/*
    For now, we have some super simple upgrade scripts.

    You can loop over all scenarios and make changes to them. If you make changes
    to the scenario, the upgrade function should return true. Otherwise, return false
    and the scenario will not be reported as updated.
*/

export async function upgradeAllScenarios() {
    // We get the saga sheet

    const scenarioNames = Object.keys(scenarios);


    const newScenarios = [];
    for (let i = 0; i < scenarioNames.length; i++) {
        const scenarioName = scenarioNames[i];
        const scenarioJSON = scenarios[scenarioName];

        // First, we load the scenario
        await runReplaceFromBase64(scenarioJSON.fileContents);

        // Then, we run the upgrade function 
        let upgraded = false;
        try {
            upgraded = await runOperation(upgrade);
            // Wait for the upgrade to take effect, just in case
        } catch (e) {
            console.log(`Error in upgrading ${scenarioName}`);
            console.log(e);
        }

        if (upgraded) {
            console.log(`Updated ${scenarioName}`);

            // If an upgrade occured, we save the update
            const newFileContents = await getFileContents();
            newScenarios.push({
                scenarioName: scenarioName,
                fileContents: newFileContents
            });
        } else {
            console.log(`No need to update ${scenarioName}`);
        }

        
    }

    newScenarios.forEach(newScenario => console.log(JSON.stringify(newScenario)));
}