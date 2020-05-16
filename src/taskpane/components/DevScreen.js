import * as React from "react";
import Taskpane from "./Taskpane";
import { StatusContext } from "./StatusContext";
import { runCleanup } from "../../saga/cleanup";
import { runTests } from "../../tests/runTests";
import { getFileContents } from "../../saga/fileUtils";
import * as scenarios from "../../../scenarios";
import { runReplaceFromBase64 } from "../../saga/create";

async function loadScenario(e) {
    e.preventDefault();

    const scenario = e.target.value;
    const fileContents = scenarios[scenario].fileContents;

    // Then, we replace the current workbook with this scenario
    await runReplaceFromBase64(fileContents);
}

async function createScenario() {
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

export default function DevScreen(props) {
    const {status, setStatus} = React.useContext(StatusContext);

    let scenarioArray = []
    Object.keys(scenarios).forEach(function(scenario) {
        scenarioArray.push(<option value={scenario}>{scenario}</option>)
    })

    return (
        <Taskpane title="Development Mode. NOTE: Run from an empty Excel workbook with no saga project">
            <button onClick={runTests}> Run Tests </button>
            <button onClick={runCleanup}> Cleanup </button>
            <button onClick={createScenario}> Create Scenario from Current Workbook (check console) </button>
            <select onChange={loadScenario}>
                <option> Select Secenario</option>
                {scenarioArray}                
            </select>
        </Taskpane>
    );


}