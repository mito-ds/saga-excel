import * as React from "react";
import { PrimaryButton } from '@fluentui/react';

// Login Form Component
export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props); 
        this.createSagaProject = this.createSagaProject.bind(this)
    }

    async createSagaProject (e) {
        e.preventDefault();
        const email = document.getElementById('email-input').value
        // TODO: send the email to the server, and log it
        this.props.setEmail(email);
        this.props.nextStep();
    }

    render () {
        return (
            <div className="content">
                <div className="header">
                    <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                    <p className="title-text" id="title-text" >You're almost ready to go. Just tell your team who you are. </p>
                </div>
                <div className="card-div">          
                    <div className="floating-card" id="email-card">
                        <p className="subtext">I’m understand that Saga is pre-alpha software. I understand that my data may be lost if I use Saga. <b>I will continue to backup my work.</b> </p>
                        <form className="form" onSubmit={this.createSagaProject}>
                            <input className="email-input input" id="email-input" placeholder="example@gmail.com" type="email"></input>
                            <PrimaryButton className="submit-button" type="submit">Submit</PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        );  
    }
}