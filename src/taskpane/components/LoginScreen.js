import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import axios from "axios";
import Taskpane from "./Taskpane";
import { headerSize } from "../../constants";


// Login Form Component
export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props); 
        this.createSagaProject = this.createSagaProject.bind(this)
    }

    async createSagaProject (e) {
        e.preventDefault();
        const email = document.getElementById('email-input').value
        try {
            // Send the signup to the server
            axios.post(
                "https://excel.sagacollab.com/postemail",
                {
                    email: email
                }
            )
        } catch {
            console.error("Failed to post email.")
        }

        this.props.setEmail(email);
        this.props.nextStep();
    }

    render () {
        return (
            <Taskpane header={headerSize.LARGE} title="You're almost ready to go. Just tell your team who you are.">
                <div className="card-div">          
                    <div className="floating-card" id="email-card">
                        <div className="subtext-div-full">
                            <p className="subtext">I understand that Saga is pre-alpha software and that my data may be lost. I will continue to backup my work. </p>
                        </div>
                        <form className="form" onSubmit={this.createSagaProject}>
                            <input className="input" id="email-input" placeholder="example@gmail.com" type="email" required></input>
                            <PrimaryButton className="submit-button" type="submit">Submit</PrimaryButton>
                        </form>
                    </div>
                </div>
            </Taskpane>
        );  
    }
}