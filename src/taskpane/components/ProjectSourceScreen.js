import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import {runCreateSaga, runCreateFromURL, createRemoteURL}  from "../../saga/create";

/* global Office */
  

// Login Form Component
export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props); 
        this.createSagaProject = this.createSagaProject.bind(this);
        this.downloadSagaProject = this.downloadSagaProject.bind(this);
    }

    async createSagaProject(e) {
        e.preventDefault();
        this.props.nextStep();
        //Create the Saga project
        const remoteURL = await createRemoteURL();
        console.log(remoteURL)

        if (!remoteURL) {
            this.props.offline();
            return;
        }

        // TODO: save email in database
        const email = this.props.email;

        // Create the project with this remote URL and email
        await runCreateSaga(remoteURL, email);


        // update the state of react component
        this.props.setURL(remoteURL)
        this.props.nextStep();
    }

    async downloadSagaProject(e) {
        e.preventDefault();
        // Download the project from the url
        this.props.nextStep();

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
                    <p className="title-text" id="title-text" >Choose your project creation method </p>
                </div>
                <div className="card-div">     
                    <p className="creation-option">Start a new project </p>     
                    <div className="floating-card create-project-card" >
                        <div className="subtext-div-half"> 
                            <p className="subtext">Turn your current workbook into a Saga project </p>
                        </div>
                        <div className="subtext-div-half"> 
                            <PrimaryButton className="submit-button center" onClick={this.createSagaProject}>Create</PrimaryButton>
                        </div>
                    </div>
                </div>
                <div className="card-div">   
                    <p className="creation-option">Or, download an existing Saga project </p>     
                    <div className="floating-card">
                        <div className="new-project-text-div"> 
                            <p className="new-project-text subtext center">Enter the url of an existing Saga project </p>
                        </div>
                        <div className="create-project-card">
                            <form className="form" onSubmit={this.downloadSagaProject}>
                                <input className="input" id="url-input" placeholder="https://excel.sagacollab.org/project/1234-12313-123123" ></input>
                                <PrimaryButton className="download-button" type="submit">Download</PrimaryButton>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );  
    }
}