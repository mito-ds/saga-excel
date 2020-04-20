import * as React from "react";
import Progress from "./Progress";
import SagaLinkScreen from "./SagaLinkScreen"
import LoginScreen from "./LoginScreen"
import ProjectSourceScreen from "./ProjectSourceScreen"
import TaskpaneFooter from "./TaskpaneFooter"
import OfflineErrorScreen from "./OfflineErrorScreen"
import MergeScreen from "./MergeProgressHandler";
import MergeSuccess from "./MergeSuccess"
import MergeError from "./MergeError"
import EmptyButton from "./saga/EmptyButton"
import { createSheet, getSheetsWithNames } from "../../saga/sagaUtils";
import { getFileContents } from "../../saga/fileUtils";

import './App.css';
import { getGlobal } from "../../commands/commands.js";
import MergeProgressHandler from "./MergeProgressHandler";


/* global */

function getTaskpaneContext() {
  const taskPaneContext = getGlobal().getTaskpaneContext()
  return taskPaneContext
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      email: '',
      remoteURL: '',
      offline: false,
      context: "share"
    };

    this.setContext = this.setContext.bind(this)
    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.offile = this.offline.bind(this);
  }

  setContext = (context) => {
    console.log(`setting the value of context to ${context}`)
    this.setState({context: context})
  }

  setEmail = (email) => {
    this.setState({email: email})
  }
    
  setURL = (remoteURL) => {
    this.setState({remoteURL: remoteURL})
  }

  offline = () => {
    this.setState({offline: true})
  }
  
  nextStep = () => {
    this.setState(state => {
      return {step: state.step + 1}
    })
  }

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Please sideload your addin to see app body." />
      );
    }

    if (this.state.offline) {
      return (
        <OfflineErrorScreen/>
      );
    }

    if (this.state.context == "merge progress") {
      console.log("found merge context")
      return (
        <MergeProgressHandler/>
      );
    } 

    if (this.state.context == "merge successful") {
      return (
        <MergeSuccess />
      )
    }

    if (this.state.context == "merge error") {
      return (
        <MergeError />
      )
    }
    
    const step = this.state.step;
    // If a saga project exists, we shouldn't do any of this

    if (step === 0) {
      return (
        <div className="taskpane">
          <LoginScreen setEmail={this.setEmail} nextStep={this.nextStep}/>
          <TaskpaneFooter/>
        </div>
      );
    } else if (step === 1) {
      return (
        <div className="taskpane">
          <ProjectSourceScreen offline={this.offline} email={this.state.email} setURL={this.setURL} nextStep={this.nextStep}/>
          <TaskpaneFooter/>
        </div>
      );
    } else if (step === 2) {
      return (
        <div className="taskpane">
          <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Creating your saga project..." />
        </div>
      );
    } else {
      // If the user has finished the creation process
      return (
        <div className="taskpane">
          <SagaLinkScreen remoteURL={this.state.remoteURL}></SagaLinkScreen>
          <TaskpaneFooter/>
        </div>
      );
    }
  }
    
    
    
    
}
