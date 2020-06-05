import * as React from "react";
import Taskpane from "./Taskpane";
import { turnSyncOff, getUpdateFromServer } from "../../saga/sync";
import { runCleanup } from "../../saga/cleanup";
import { runAllTests, runTestSuite } from "../../tests/runTests";
import * as testSuites from "../../tests/";
import { headerSize, TEST_URL } from "../../constants";
import { upgradeAllScenarios } from "../../saga/upgrade";

import { getFileContents } from "../../saga/fileUtils";
import * as scenarios from "../../tests/scenarios";
import { runReplaceFromBase64 } from "../../saga/create";
import Project from "../../saga/Project";

/* global Excel */

async function loadScenario(e) {
    e.preventDefault();

    const scenario = e.target.value;
    const fileContents = scenarios[scenario].fileContents;

    // Then, we replace the current workbook with this scenario
    await runReplaceFromBase64(fileContents);
}

async function createScenario() {
    // First, we make sure we're using the test url, so we don't sync things to the scenario
    await Excel.run(async (context) => {
        const project = new Project(context);
        await project.setRemoteURL(TEST_URL);
    });

    // We just get the 
    const fileContents = await getFileContents();

    console.log(`To create a new scenario, create a <<scenario>>.json file in the scenarios folder.`);
    console.log(`Copy in the JSON object below, and import and then export this object from the index.js`);
    console.log(`file in the scenarios folder.`);

    console.log(JSON.stringify({
        scenario: "<<scenario>>",
        fileContents: fileContents
    }));
}
 

export default class DevScreen extends React.Component {

    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            multiplayerScenarioName: '',
            multiplayerScenario: {}
        }
        this.handleMultiplayerChange = this.handleMultiplayerChange.bind(this);
        this.createMultiplayerScenario = this.createMultiplayerScenario.bind(this);
    }

    createMultiplayerScenario = async (event) => {

        event.preventDefault();
        const scenarioName = this.state.multiplayerScenarioName;

        // First, we have to switch the remote URL to the TEST URL at the correct step
        let remoteURL;
        await Excel.run(async (context) => {
            const project = new Project(context);
            remoteURL = await project.getRemoteURL();
            await project.setRemoteURL(`${TEST_URL}/${scenarioName}`);
        });

        // Then, we get the file contents with the testing url
        const originalFileContents = await getFileContents();

        // And then set the URL back to its original value
        await Excel.run(async (context) => {
            const project = new Project(context);
            await project.setRemoteURL(remoteURL);
        });

        // Then, from now on, we intercept all incoming syncs, and append it onto the steps
        turnSyncOff();

        this.setState({
            multiplayerScenario: {
                "scenarioName": scenarioName,
                "fileContents": originalFileContents,
                "syncSteps": []
            }
        });

        let stepNumber = 0;

        const fakeSync = async () => {
            // We get the incomming data, and append it to the mulitplayer scenario
            await Excel.run(async (context) => {
                const project = new Project(context);                
                const headCommitID = await project.getCommitIDFromBranch(`master`);
                const parentCommitID = await project.getParentCommitID(headCommitID);
                const remoteURL = await project.getRemoteURL();

                // If there is an update, we add the update to the local project, and add it to the scenario
                const update = await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
                console.log(update);
                if ("fileContents" in update) {
                    console.log(`Saving step ${stepNumber}`);

                    this.setState((state) => {

                        const newSyncSteps = state.multiplayerScenario.syncSteps.concat(
                            {
                                "scenarioName": scenarioName,
                                "stepNumber": stepNumber,
                                "fileContents": update.fileContents,
                                "commitIDs": update.commitIDs,
                                "commitSheets": update.commitSheets
                            }
                        );

                        return {
                            multiplayerScenario: {
                                "scenarioName": state.multiplayerScenario.scenarioName,
                                "fileContents": state.multiplayerScenario.fileContents,
                                "syncSteps": newSyncSteps
                            }
                        }
                    });

                    stepNumber++;
                }
            })
        }

        // We try to get new incoming sync data every second
        setInterval(fakeSync, 1000);
    }


    finishMultiplayerScenario = () => {
        console.log(JSON.stringify(this.state.multiplayerScenario));
    }

    handleMultiplayerChange(event) {
        this.setState({multiplayerScenarioName: event.target.value});
    }

    render() {
        let testSuiteArray = [];
        Object.keys(testSuites).forEach(function(testSuite) {
            testSuiteArray.push(<option key={testSuite} value={testSuite}>{testSuite}</option>)
        });


        let scenarioArray = [];
        Object.keys(scenarios).forEach(function(scenario) {
            scenarioArray.push(<option key={scenario} value={scenario}>{scenario}</option>);
        });

        return (
            <Taskpane header={headerSize.LARGE} title="Development Mode. Careful there, power user.">
                <div style={devScreenStyle}>
                    <div className="floating-card" style={devScreenStyle}>
                        Cleanup
                        <button onClick={runCleanup}> Cleanup </button>
                    </div>
                    <div className="floating-card" style={devScreenStyle}>
                        Testing
                        <button onClick={runAllTests}> Run Tests </button>
                        <select onChange={async (e) => {await runTestSuite(e.target.value);}}>
                            <option> Select Test Suite</option>
                            {testSuiteArray}                
                        </select>
                    </div>
                    <div className="floating-card" style={devScreenStyle}>
                        Scenarios
                        <button onClick={createScenario}> Create Scenario from Current Workbook </button>
                        <form className="form" onSubmit={this.createMultiplayerScenario}>
                            <label>
                                Create Multiplayer Scenario:
                                <input type="text" value={this.state.multiplayerScenarioName} onChange={this.handleMultiplayerChange} />        
                            </label>
                            <input type="submit" value="Start" />
                            <button type="button" onClick={this.finishMultiplayerScenario}>Finish</button>
                        </form>
                        <select onChange={loadScenario}>
                            <option> Select Secenario</option>
                            {scenarioArray}                
                        </select>
                        <button onClick={upgradeAllScenarios}> Upgrade All Scenarios </button>
                    </div>
                    

                </div>
            </Taskpane>
        );
    }

}


const devScreenStyle = {
    'display': 'flex',
    'flexDirection': 'column',
    'textAlign': 'center',
};