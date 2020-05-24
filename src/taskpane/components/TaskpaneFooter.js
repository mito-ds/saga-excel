import * as React from "react";
import { StatusContext } from "./StatusContext";
import { taskpaneStatus } from "../../constants";

import './TaskpaneFooter.css';


/* global */

export default function TaskpaneFooter(props) {
    const { status, setStatus } = React.useContext(StatusContext);

    var buttonText;
    if (status === taskpaneStatus.DEVELOPMENT) {
        buttonText = taskpaneStatus.CREATE;
    } else {
        buttonText = taskpaneStatus.DEVELOPMENT;
    }

    return (
        <div className="footer">
            <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagacollab.com/howto">FAQ</a> or leave us <a href="https://sagacollab.com/contact">feedback</a></b></p>
            <p className="subtext-disclaimer"> Saga is in pre-alpha stage. Make sure you back up your work! </p>
            <button onClick={() => {setStatus(buttonText);}}>{buttonText}</button>
        </div>
    );
}
