import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import {runCreateBranch} from "../../saga/branch"
import {runCreateSaga, setPersonalBranchName, getRemoteURLFromTaskpane}  from "../../saga/create";
import {runSwitchVersionFromRibbon} from "../../saga/checkout"

// Login Form Component
class CreateSagaProjectScreen extends React.Component {
    constructor() {
        super(); 
        
        this.createSagaProject = this.createSagaProject.bind(this)
    }

    async createSagaProject (e) {
        e.preventDefault();
        //Create the Saga project
        console.log("HERE")
        await runCreateSaga();
        const remoteURL = await getRemoteURLFromTaskpane();
    
        //Create and checkout personal branch
        //Todo: Save email in database
        const email = document.getElementById('email-input').value
        await runCreateBranch(email)
        await setPersonalBranchName(email)
        await runSwitchVersionFromRibbon()
    
        // update the state of react component
        this.props.doneCreate(remoteURL);
    }

    render () {
        return (
            <div className="content">
                <div className="header">
                    <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                    <p className="title-text" id="title-text" >You're almost ready to start collaborating - just tell your team who you are</p>
                </div>
                <div className="card-div">          
                    <div className="floating-card" id="email-card">
                        <p className="subtext">I’m using Saga knowing that it is in a pre-alpha stage. I understand that my data may be lost and <b>I will continue to backup my work.</b> </p>
                        <form className="form" onSubmit={this.createSagaProject}>
                            <input className="email-input" id="email-input" placeholder="example@gmail.com" type="email"></input>
                            <PrimaryButton className="submit-button" type="submit">Submit</PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        );  
    }
}

// Export CreateSagaProjectScreen
export default CreateSagaProjectScreen;