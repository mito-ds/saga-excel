import * as React from "react";
import './App.css';


/* global */

export default class TaskpaneFooter extends React.Component {
    render() {
        return (
            <div className="footer">
                <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagacollab.com/howto">FAQ</a> or leave us <a href="https://sagacollab.com/contact">feedback</a></b></p>
                <p className="subtext-disclaimer"> Saga is in pre-alpha stage. Make sure you back up your work! </p>
            </div>
        )
    }
}
