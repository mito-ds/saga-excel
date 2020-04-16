import * as React from "react";
import './App.css';


/* global */

export default class TaskpaneFooter extends React.Component {
    render() {
        return (
            <div className="footer">
                <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagalab.org/">FAQ</a></b></p>
                <p className="subtext disclaimer"> Saga is in pre-alpha stage. Use this tool knowing your data may be lost. </p>
            </div>
        )
    }
}
