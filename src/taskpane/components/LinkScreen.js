import * as React from "react";
import TaskpaneFooter from "./TaskpaneFooter";

// Login Form Component
export default class LinkScreen extends React.Component {
    constructor(props) {
        super();  
        this.state = {
            remoteURL: props.remoteURL
        };
        this.copyToClipboard = this.copyToClipboard.bind(this)
    }

    // Copy project link to clipboard
    copyToClipboard(e) {
        e.preventDefault();
        var copyText = document.getElementById("project-link");
        copyText.select();
        document.execCommand("copy");
    }

    render () {
        return (
            <div className="taskpane">
                <div className="content">
                    <div className="header">
                        <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                        <p className="title-text" id="title-text"> Invite people to collaborate by sending them the Saga project link</p>
                    </div>
                    <div className="floating-card" id="project-link-card">
                        <form className="form" onSubmit={this.copyToClipboard}>
                            <input className="project-link-div input" id="project-link" value={this.state.remoteURL} disabled></input>
                            <input className="clipboard" type="image" src="assets/clipboard.png" width="30vw" border="0" alt="Submit" />
                        </form>
                    </div>
                </div>
                <TaskpaneFooter/>
            </div>
        );
    }
}