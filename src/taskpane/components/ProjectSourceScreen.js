import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import {runCreateBranch} from "../../saga/branch"
import {runCreateSaga, setPersonalBranchName, getRemoteURLFromTaskpane, runCreateFromURL}  from "../../saga/create";
import {runSwitchVersionFromRibbon} from "../../saga/checkout"


// Disable create saga button, turn others on 
function toggleRibbonAvailability() {
    Office.ribbon.requestUpdate({
        tabs: [
            {
                id: "TabHome", 
                controls: [
                {
                    id: "MergeButton", 
                    enabled: true
                }, 
                {   
                    id: "VersionButton", 
                    enabled: true
                },
                {   
                    id: "ResetPersonalButton", 
                    enabled: true
                },
                {   
                    id: "ShareProjectButton", 
                    enabled: true
                },
                {   
                    id: "TaskpaneButton", 
                    enabled: false
                }  
            ]}
        ]
    });
}
  

// Login Form Component
export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props); 
        this.createSagaProject = this.createSagaProject.bind(this)
    }

    async createSagaProject(e) {
        e.preventDefault();
        this.props.nextStep();
        //Create the Saga project
        await runCreateSaga();
        const remoteURL = await getRemoteURLFromTaskpane();
    
        //Create and checkout personal branch
        //Todo: Save email in database
        const email = this.props.email;
        await runCreateBranch(email)
        await setPersonalBranchName(email)
        await runSwitchVersionFromRibbon()

        // toggle ribbon buttons availability
        toggleRibbonAvailability()
    
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

        // toggle ribbon buttons availability
        toggleRibbonAvailability()
        
        this.props.setURL(url)
        this.props.nextStep();
    }

    render () {
        return (
            <div className="content">
                <div className="header">
                    <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                    <p className="title-text" id="title-text" >Pick your project creation method </p>
                </div>
                <div className="card-div">     
                    <p className="creation-option">1. Start a new project </p>     
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
                    <p className="creation-option">2. Download a Saga project </p>     
                    <div className="floating-card">
                        <div className="new-project-text-div"> 
                            <p className="new-project-text center">Enter the url of an existing saga project </p>
                        </div>
                        <div className="create-project-card">
                            <form className="form" onSubmit={this.createSagaProject}>
                                <input className="input" id="url-input" placeholder="https://excel.sagalab.org/project/1234-12313-123123" ></input>
                                <PrimaryButton className="download-button" type="submit">Download</PrimaryButton>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );  
    }
}