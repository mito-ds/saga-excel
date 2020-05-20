import * as React from "react";
import Taskpane from "./Taskpane";

/* global Office */

export class OutOfDateErrorScreen extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
        return (
            <Taskpane title="Sorry, your Excel isn't up to date.">
                <div className="card-div">
                    Some of Saga's features need a more recent Excel version to work. Please reach out to nate@sagacollab.com if you think this is a mistake, or have any questions.
                </div>
            </Taskpane>
        );  
    }
}

export function logOutOfDate() {
    // Loops over the requirment sets until it finds one it supports

    console.error("This version of office is out of date.");

    const reqSets = ["1.11", "1.10", "1.9", "1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1", "1.0"];

    for (let i = 0; i < reqSets.length; i++) {
        const reqSet = reqSets[i];
        if (Office.context.requirements.isSetSupported("ExcelApi", reqSet)) {
            console.log(`Supports at most requirement set: ${reqSet}`);
            break;
        }
    }
}