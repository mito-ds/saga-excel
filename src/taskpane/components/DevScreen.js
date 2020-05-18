import * as React from "react";
import log from "loglevel";
import Taskpane from "./Taskpane";
import { StatusContext } from "./StatusContext";
import { runCleanup } from "../../saga/cleanup";
import { runTests } from "../../tests/runTests";
import { headerSize, TEST_URL } from "../../constants";

import { getFileContents } from "../../saga/fileUtils";
import * as scenarios from "../../../scenarios";
import { runReplaceFromBase64 } from "../../saga/create";
import Project from "../../saga/Project";
import { silenceLog, enableLog } from "../logging";

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
        project.setRemoteURL(TEST_URL);
    })

    // We just get the 
    const fileContents = await getFileContents();

    console.log(`To create a new scenario, create a <<scenario>>.json file in the scenarios folder.`)
    console.log(`Copy in the JSON object below, and import and then export this object from the index.js`)
    console.log(`file in the scenarios folder.`)

    console.log(JSON.stringify({
        scenario: "<<scenario>>",
        fileContents: fileContents
    }))
}

function test(e) {
    const logName = e.target.value;
    const silence = !e.target.checked;
    if (silence) {
        silenceLog(logName);
    } else {
        enableLog(logName);
    }
}


export default function DevScreen(props) {
    const {status, setStatus} = React.useContext(StatusContext);

    let scenarioArray = [];
    Object.keys(scenarios).forEach(function(scenario) {
        scenarioArray.push(<option key={scenario} value={scenario}>{scenario}</option>)
    })

    let logArray = [];
    const loggers = Object.keys(log.getLoggers());
    loggers.forEach(logName => {
        logArray.push(
            <div>
                <input type="checkbox" id={logName} key={logName} value={logName} defaultChecked={true} onClick={test}/>
                <label key={logName + "l"}> {logName}</label>
            </div>
        )
    })



    return (
        <Taskpane header={headerSize.LARGE} title="Development Mode. NOTE: Run from an empty Excel workbook with no saga project">
             <div className="card-div" key="top">
                <div className="floating-card" key="cleanup">
                    <button onClick={runCleanup}> Cleanup </button>
                </div>
                <div className="floating-card" key="test">
                    <button onClick={runTests}> Run Tests </button>
                </div>
                <div className="floating-card" key="scenario">
                    <button onClick={createScenario}> Create Scenario from Current Workbook (check console) </button>
                    <select onChange={loadScenario}>
                        <option> Select Secenario</option>
                        {scenarioArray}                
                    </select>
                </div>
                <div className="floating-card" key="logs">
                    Logs: 
                    {logArray}
                </div>
                
            </div>
        </Taskpane>
    );


}