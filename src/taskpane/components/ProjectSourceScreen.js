import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import {runCreateBranch} from "../../saga/branch"
import {runCreateSaga, setPersonalBranchName, getRemoteURLFromTaskpane, runCreateFromURL}  from "../../saga/create";
import {runSwitchVersionFromRibbon} from "../../saga/checkout"

// Login Form Component
export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props); 
        this.createSagaProject = this.createSagaProject.bind(this)
    }

    async createSagaProject(e) {
        e.preventDefault();
        //Create the Saga project
        await runCreateSaga();
        const remoteURL = await getRemoteURLFromTaskpane();
    
        //Create and checkout personal branch
        //Todo: Save email in database
        const email = this.props.email;
        await runCreateBranch(email)
        await setPersonalBranchName(email)
        await runSwitchVersionFromRibbon()
    
        // update the state of react component
        this.props.setURL(remoteURL)
        this.props.nextStep();
    }

    async downloadSagaProject(e) {
        e.preventDefault();
        // Download the project from the url
        const url = document.getElementById('url-input').value
        await runCreateFromURL(url, this.props.email);
        this.props.setURL(url)
        this.props.nextStep();
    }

    render () {
        return (
            <div className="content">
                <div className="header">
                    <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                    <p className="title-text" id="title-text" >Either create a new project, or download one your team is already working on </p>
                </div>
                <div className="card-div">          
                    <div className="floating-card" >
                        <p className="subtext">Create a new project </p>
                        <PrimaryButton className="submit-button" onClick={this.createSagaProject}>Create</PrimaryButton>
                    </div>
                </div>
                <div className="card-div">          
                    <div className="floating-card" >
                        <p className="subtext">Enter the url of an existing saga project </p>
                        <form className="form" onSubmit={this.createSagaProject}>
                            <input className="input" id="url-input" placeholder="https://excel.sagalab.org/project/1234-12313-123123" ></input>
                            <PrimaryButton className="submit-button" type="submit">Download</PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        );  
    }
}