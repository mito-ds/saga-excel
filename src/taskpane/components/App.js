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
import MergeForked from "./MergeForked"
import EmptyButton from "./saga/EmptyButton"
import { createSheet, getSheetsWithNames } from "../../saga/sagaUtils";
import { getFileContents } from "../../saga/fileUtils";

import './App.css';
import { getGlobal } from "../../commands/commands.js";
import MergeProgressHandler from "./MergeProgressHandler";


/* global */

export const taskpaneStatus = {
  CREATE: 'create',
  SHARE: 'share',
  MERGE_PROGRESS: 'merge_progress',
  MERGE_SUCCESS: 'merge_success',
  MERGE_ERROR: 'merge_error',
  MERGE_FORKED: 'merge_forked'
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      email: '',
      remoteURL: '',
      offline: false,
      taskpaneStatus: taskpaneStatus.CREATE
    };

    this.setTaskpaneStatus = this.setTaskpaneStatus.bind(this)
    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.offile = this.offline.bind(this);
  }

  setTaskpaneStatus = (taskpaneStatus) => {
    console.log(`setting the value of context to ${taskpaneStatus}`)
    this.setState({taskpaneStatus: taskpaneStatus})
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

    switch(this.state.taskpaneStatus) {
      case taskpaneStatus.MERGE_PROGRESS:
        return (
          <MergeProgressHandler/>
        );
      
      case taskpaneStatus.MERGE_SUCCESS:
        return (
          <MergeSuccess />
        )
      
      case taskpaneStatus.MERGE_ERROR:
        return (
          <MergeError />
        )

      case taskpaneStatus.MERGE_FORKED:
        return (
          <MergeForked />
        )

      case taskpaneStatus.SHARE:
        return (
          <div className="taskpane">
            <SagaLinkScreen remoteURL={this.state.remoteURL}></SagaLinkScreen>
            <TaskpaneFooter/>
          </div>
        );

      case taskpaneStatus.CREATE:
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
}
