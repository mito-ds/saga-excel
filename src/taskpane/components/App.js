import * as React from "react";
import Progress from "./Progress";
import LinkScreen from "./LinkScreen"
import LoginScreen from "./LoginScreen"
import ProjectSourceScreen from "./ProjectSourceScreen"
import TaskpaneFooter from "./TaskpaneFooter"
import OfflineErrorScreen from "./OfflineErrorScreen"
import MergeScreen from "./MergeScreen";
import { taskpaneStatus, mergeState } from "../../constants";

import './App.css';

/* global */

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      email: '',
      remoteURL: '',
      offline: false,
      taskpaneStatus: taskpaneStatus.CREATE,
      mergeState: mergeState.MERGE_SUCCESS
    };

    this.setTaskpaneStatus = this.setTaskpaneStatus.bind(this)
    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.offline = this.offline.bind(this);
    this.setMergeState = this.setMergeState.bind(this);

  }

  setTaskpaneStatus = (taskpaneStatus) => {
    console.log(`setting the value of taskpaneState to ${taskpaneStatus}`)
    this.setState({taskpaneStatus: taskpaneStatus})
  }

  setMergeState = (mergeState) => {
    this.setState({mergeState: mergeState})
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
      case taskpaneStatus.MERGE:
        return (<MergeScreen mergeState={this.state.mergeState}/>);

      case taskpaneStatus.SHARE:
        return (<LinkScreen remoteURL={this.state.remoteURL}/>);

      case taskpaneStatus.CREATE:
        const step = this.state.step;
        // If a saga project exists, we shouldn't do any of this
    
        if (step === 0) {
          return (
            <LoginScreen setEmail={this.setEmail} nextStep={this.nextStep}/>
          );
        } else if (step === 1) {
          return (
            <ProjectSourceScreen offline={this.offline} email={this.state.email} setURL={this.setURL} nextStep={this.nextStep}/>
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
            <LinkScreen remoteURL={this.state.remoteURL}></LinkScreen>
          );
        }
    }    
  }  
}
