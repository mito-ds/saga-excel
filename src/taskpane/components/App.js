import * as React from "react";
import Header from "./Header";
import { PrimaryButton } from '@fluentui/react';
import HeroList from "./HeroList";
import Progress from "./Progress";
import CreateButton from "./saga/CreateButton";
import SeePreviousCommitForm from "./saga/SeePreviousCommitForm";
import CommitForm from "./saga/CommitForm";
import CleanupButton from "./saga/CleanupButton";
import CreateBranchInput from "./saga/CreateBranchInput";
import CheckoutBranchInput from "./saga/CheckoutInput";
import CheckinButton from "./saga/CheckinButton";
import CreateFromRemoteForm from './saga/CreateFromRemoteForm'
import ResetPersonalButton from './saga/ResetPersonalButton'
//import { updateShared } from "./saga/sync";

import './App.css';

/* global */

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: []
    };
  }

  componentDidMount() {
    this.setState({
      listItems: [
        {
          icon: "Ribbon",
          primaryText: "Achieve more with Office integration"
        },
        {
          icon: "Unlock",
          primaryText: "Unlock features and functionality"
        },
        {
          icon: "Design",
          primaryText: "Create and visualize like a pro"
        }
      ]
    });
  }


  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Please sideload your addin to see app body." />
      );
    }
    return (
      <div className="taskpane">
        <div className="content">
          <div className="header">
            <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
            <p className="title-text">You're almost ready to start collaborating - just tell your team who you are</p>
          </div>
          <div className="card-div">          
            <div className="floating-card">
              <p className="subtext">I’m using Saga knowing that it is in a pre-alpha stage. I understand that my data may be lost and <b>I will continue to backup my work.</b> </p>
              <form className="form">
                <input className="email-input" placeholder="example@gmail.com" type="email"></input>
                <PrimaryButton className="submit-button">Submit</PrimaryButton>
              </form>
            </div>
          </div>
          
        </div>
        <div className="footer">
          <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagalab.org/">FAQ</a></b></p>
          <p className="subtext disclaimer"> Saga is in pre-alpha stage. Use this tool knowing your data may be lost. </p>
        </div>
      </div>
    );
  }
}
