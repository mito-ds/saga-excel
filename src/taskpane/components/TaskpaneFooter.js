import * as React from "react";
import { StatusContext } from "./StatusContext";
import { taskpaneStatus } from "../../constants";
import { createRemoteURL, runCreateSaga } from "../../saga/create";
import { deleteSagaSheets } from "../../saga/sagaUtils";

import './TaskpaneFooter.css';
import { MultiplayerScenarioContext } from "./MultiplayerScenarioContext";

/* global Excel */


async function makeSharable() {
    // First, clear out the existing saga project
    await Excel.run(async(context) => {
        await deleteSagaSheets(context);
    });

    // Then, create a new saga project
    const remoteURL = await createRemoteURL();
    await runCreateSaga(remoteURL, "email");

    console.log("Creating with url", remoteURL);

    // Set the share link in the app
    window.app.setURL(remoteURL);
}


/* global */

export default function TaskpaneFooter(props) {
    const { status, setStatus } = React.useContext(StatusContext);
    const { scenario, setScenario } = React.useContext(MultiplayerScenarioContext);

    var buttonText;
    if (status === taskpaneStatus.DEVELOPMENT) {
        buttonText = taskpaneStatus.CREATE;
    } else {
        buttonText = taskpaneStatus.DEVELOPMENT;
    }

    let scenarioButton;
    if (scenario) {
        if (!scenario.isFinished()) {
            scenarioButton = (<button onClick={async () => {await scenario.nextSyncStep(); setScenario(scenario);}}>Advance Scenario</button>);
        } else {
            scenarioButton = (<button onClick={async() => {await makeSharable(); setScenario(null);}}>Add Share Link</button>);
        }
    }

    return (
        <div className="footer">
            <p className="FAQ-text"> <b>Q's? See our <a href="https://sagacollab.com/instructions">instructions</a> or shoot us a message at founders@sagacollab.com</b></p>
            <p className="subtext-disclaimer"> Saga is in pre-alpha. Make sure to back up your work! </p>
            <button onClick={() => {setStatus(buttonText);}}>{buttonText}</button>
            {scenarioButton}
        </div>
    );
}
