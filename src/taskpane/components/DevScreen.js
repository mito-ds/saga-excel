import React, { useState, useEffect } from 'react';
import Taskpane from "./Taskpane";
import { turnSyncOff, getUpdateFromServer } from "../../saga/sync";
import { runCleanup } from "../../saga/cleanup";
import { runAllTests, runTestSuite } from "../../tests/runTests";
import { MultiplayerScenario } from "../../tests/testHelpers";
import * as testSuites from "../../tests/";
import { headerSize, TEST_URL } from "../../constants";
import { upgradeAllScenarios } from "../../saga/upgrade";
import { MultiplayerScenarioContext } from "./MultiplayerScenarioContext";

import { getFileContents } from "../../saga/fileUtils";
import * as scenarios from "../../tests/scenarios";
import * as multiplayer from "../../tests/scenarios/multiplayer";
import { runReplaceFromBase64 } from "../../saga/create";
import Project from "../../saga/Project";

/* global Excel */

async function loadScenario(e) {
    e.preventDefault();

    // Get the correct scenario, and insert it into the workbook
    const scenario = scenarios[e.target.value];
    await runReplaceFromBase64(scenario.fileContents);
}



async function createScenario() {
    console.log("Making scenario");
    // First, we make sure we're using the test url, so we don't sync things to the scenario
    try {
        await Excel.run(async (context) => {
            const project = new Project(context);
            await project.setRemoteURL(TEST_URL);
        });
        console.log("Setting test url.");
    } catch (e) {
        console.log("No saga project. No need to set test url");
    }
    

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
 

export default function DevScreen(props) {

    const [multiplayerScenarioName, setMultiplayerScenarioName] = useState("");
    const [multiplayerScenarioCreated, setMultiplayerScenarioCreated] = useState(null);
    const [step, setStep] = useState(-1);

    const { setScenario } = React.useContext(MultiplayerScenarioContext);

    const loadMultiplayerScenario = async (e) => {
        e.preventDefault();

        const multiplayerScenarioName = e.target.value;
        const newScenario = new MultiplayerScenario(multiplayerScenarioName);
        await newScenario.start();

        setScenario(newScenario);
    };

    // Taken from https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
    useEffect(() => {
        const interval = setInterval(async () => {
            console.log("running interval ons step", step);
            // We just check to see if there is an update, and then update if we can
            
            let update;
            await Excel.run(async (context) => {
                const project = new Project(context);                
                const headCommitID = await project.getCommitIDFromBranch(`master`);
                const parentCommitID = await project.getParentCommitID(headCommitID);
                const remoteURL = await project.getRemoteURL();

                // If there is an update, we add the update to the local project, and add it to the scenario
                update = await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
            });
            

            if (update) {
                console.log(`Saving step ${step}`);

                if (!multiplayerScenarioCreated) {
                    return;
                }
                const newSyncStep = {
                    "scenarioName": multiplayerScenarioName,
                    "stepNumber": step,
                    "fileContents": update.fileContents,
                    "commitIDs": update.commitIDs,
                    "commitSheets": update.commitSheets
                };

                console.log("Old sync steps", multiplayerScenarioCreated.syncSteps);

                const newSyncSteps = multiplayerScenarioCreated.syncSteps.concat(newSyncStep); 

                console.log("New sync steps", newSyncSteps);

                setStep(step + 1);
                console.log(`Updated step`);

                setMultiplayerScenarioCreated({
                    "scenarioName": multiplayerScenarioCreated.scenarioName,
                    "fileContents": multiplayerScenarioCreated.fileContents,
                    "syncSteps": newSyncSteps
                });
            }
          }, 1000);
          return () => clearInterval(interval);

    }, [step, multiplayerScenarioCreated]);
    
    const createMultiplayerScenario = async (event) => {
        event.preventDefault();
        turnSyncOff();

        // First, we have to switch the remote URL to the TEST URL at the correct step
        let remoteURL;
        await Excel.run(async (context) => {
            const project = new Project(context);
            remoteURL = await project.getRemoteURL();
            await project.setRemoteURL(`${TEST_URL}/${multiplayerScenarioName}`);
        });


        // Then, we get the file contents with the testing url
        const originalFileContents = await getFileContents();

        // And then set the URL back to its original value
        await Excel.run(async (context) => {
            const project = new Project(context);
            await project.setRemoteURL(remoteURL);
        });

        console.log("Restored old remote URL");

        setMultiplayerScenarioCreated({
            "scenarioName": multiplayerScenarioName,
            "fileContents": originalFileContents,
            "syncSteps": []
        });

        // Finially, we update the step, to trigger useEffect
        setStep(0);
    };


    const finishMultiplayerScenario = () => {
        console.log(JSON.stringify(multiplayerScenarioCreated));
    };

    const handleMultiplayerChange = (event) => {
        setMultiplayerScenarioName(event.target.value);
    };


    // We build an option for each 
    let testSuiteArray = [];
    Object.keys(testSuites).forEach(function(testSuiteName) {
        testSuiteArray.push(<option key={testSuiteName} value={testSuiteName}>{testSuiteName}</option>)
    });

    let testArray = [];
    Object.keys(testSuites).forEach((testSuiteName) => {
        let testSuite = testSuites[testSuiteName];
        Object.keys(testSuite).forEach(testName => {
            const value = JSON.stringify({
                testSuiteName: testSuiteName,
                testName: testName
            });
            const key = testSuiteName + " : " + testName;

            testArray.push(<option key={key} value={value}>{key}</option>)
        });
    });

    let scenarioArray = [];
    Object.keys(scenarios).forEach(function(scenario) {
        scenarioArray.push(<option key={scenario} value={scenario}>{scenario}</option>);
    });

    let multiplayerScenarioArray = [];
    Object.keys(multiplayer).forEach(function(multiplayerScenarioName) {
        multiplayerScenarioArray.push(
            <option 
                key={multiplayerScenarioName} 
                value={multiplayerScenarioName}>
                    {multiplayerScenarioName}
            </option>
        );
    });

    const cleanup = async (e) => {
        e.preventDefault();
        await runCleanup();

        // Also, we make sure to clear any scenario that might be running
        setScenario(null);
    };

    return (
        <Taskpane header={headerSize.LARGE} title="Development Mode. Careful there, power user.">
            <div style={devScreenStyle}>
                <div className="floating-card" style={devScreenStyle}>
                    Cleanup
                    <button onClick={cleanup}> Cleanup </button>
                </div>
                <div className="floating-card" style={devScreenStyle}>
                    Testing
                    <button onClick={runAllTests}> Run Tests </button>
                    <select onChange={async (e) => {await runTestSuite(e.target.value);}}>
                        <option> Select Test Suite</option>
                        {testSuiteArray}                
                    </select>
                    <select onChange={async (e) => {
                            let testObj = JSON.parse(e.target.value);
                            await runTestSuite(testObj.testSuiteName, testObj.testName);
                        }}>
                        <option> Select Individual Test</option>
                        {testArray}                
                    </select>
                </div>
                <div className="floating-card" style={devScreenStyle}>
                    Scenarios
                    <button onClick={createScenario}> Create Scenario from Current Workbook </button>
                    <form className="form" onSubmit={createMultiplayerScenario}>
                        <label>
                            Create Multiplayer Scenario:
                            <input type="text" value={multiplayerScenarioName} onChange={handleMultiplayerChange} />        
                        </label>
                        <input type="submit" value="Start" />
                        <button type="button" onClick={finishMultiplayerScenario}>Finish</button>
                    </form>
                    <select onChange={loadScenario}>
                        <option> Select Secenario</option>
                        {scenarioArray}                
                    </select>
                    <select onChange={loadMultiplayerScenario}>
                        <option> Select Mulitplayer Scenario</option>
                        {multiplayerScenarioArray}                
                    </select>
                    <button onClick={upgradeAllScenarios}> Upgrade All Scenarios </button>
                </div>
                

            </div>
        </Taskpane>
    );
}


const devScreenStyle = {
    'display': 'flex',
    'flexDirection': 'column',
    'textAlign': 'center',
};