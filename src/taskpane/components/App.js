import * as React from "react";
import Progress from "./Progress";
import LinkScreen from "./LinkScreen";
import LoginScreen from "./LoginScreen";
import HelpScreen from "./HelpScreen";
import ProjectSourceScreen from "./ProjectSourceScreen";
import { OutOfDateErrorScreen, logOutOfDate } from "./OutOfDateErrorScreen";
import CellEdittingModeErrorScreen from "./CellEdittingModeErrorScreen";
import DevScreen from "./DevScreen";
import MergeScreen from "./MergeScreen";
import { StatusContext } from "./StatusContext";
import { taskpaneStatus, mergeState } from "../../constants";
import { sagaProjectJSON } from "../../saga/sagaUtils";


import './App.css';
import DiffScreen from "./DiffComponents/DiffScreen";

/* global Office */

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      email: '',
      remoteURL: '',
      offline: false,
      taskpaneStatus: taskpaneStatus.CREATE,
      mergeState: mergeState.MERGE_SUCCESS,
      mergeConflicts: null,
      sheetDiffs: null,
      safetyCommit: false
    };

    this.getTaskpaneStatus = this.getTaskpaneStatus.bind(this);
    this.setTaskpaneStatus = this.setTaskpaneStatus.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.offline = this.offline.bind(this);
    this.getMergeState = this.getMergeState.bind(this);
    this.setMergeState = this.setMergeState.bind(this);
    this.setSheetDiffs = this.setSheetDiffs.bind(this);
    this.setSafetyCommit = this.setSafetyCommit.bind(this);
  }

  /*
  If there is a saga project already, we load it into the taskpane
  */
  async componentDidUpdate(prevProps) {
    if (!prevProps.isOfficeInitialized && this.props.isOfficeInitialized) {
      const projectObj = await sagaProjectJSON();
      if (("remoteURL" in projectObj)) {
        this.setURL(projectObj["remoteURL"]);
        this.setEmail(projectObj["email"]);
        this.setTaskpaneStatus(taskpaneStatus.SHARE);
      }
    }
  }

  getTaskpaneStatus = () => {
    return this.state.taskpaneStatus;
  }

  setTaskpaneStatus = (taskpaneStatus) => {
    console.log(`setting the value of taskpaneState to ${taskpaneStatus}`)
    this.setState({taskpaneStatus: taskpaneStatus})
  }

  getMergeState = () => {
    return this.state.mergeState;
  }

  setMergeState = (mergeState) => {
    this.setState({
      mergeState: mergeState.status, 
      mergeConflictData: mergeState.mergeConflictData
    })
  }

  setEmail = (email) => {
    this.setState({email: email})
  }
    
  setURL = (remoteURL) => {
    this.setState({remoteURL: remoteURL})
  }

  setSheetDiffs = (sheetDiffs) => {
    this.setState({sheetDiffs: sheetDiffs})
  }

  setSafetyCommit = (safetyCommit) => {
    this.setState({safetyCommit: safetyCommit})
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

    // TODO: check if office is initialized, and that we are online
    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Please sideload your addin to see app body." />
      );
    }
    

    /*
      We check to make sure some minimum version of the ExcelApi is supported. Note that this is actually not
      enough - we want to check that the preview set is supported (so we get addFromBase64), but I can't figure
      out how to check this programmatically.
    */
    if (!Office.context.requirements.isSetSupported("ExcelApi", "1.11")) {
      // We then log what their current version of the UI is
      logOutOfDate();
      return (<OutOfDateErrorScreen/>);
    }

    var toReturn;
    


    switch(this.state.taskpaneStatus) {
      case taskpaneStatus.DEVELOPMENT:
        toReturn = (<DevScreen/>);
        break;

      case taskpaneStatus.MERGE:
        toReturn = (<MergeScreen mergeState={this.state.mergeState} mergeConflictData={this.state.mergeConflictData}/>);
        break;

      case taskpaneStatus.SHARE:
        toReturn = (<LinkScreen remoteURL={this.state.remoteURL}/>);
        break;

      case taskpaneStatus.DIFF:
        toReturn = (<DiffScreen sheetDiffs={this.state.sheetDiffs}/>);
        break;

      case taskpaneStatus.CELL_EDITTING_MODE:
        toReturn = (<CellEdittingModeErrorScreen safetyCommit={this.state.safetyCommit}></CellEdittingModeErrorScreen>);
        break;

      case taskpaneStatus.HELP:
        toReturn = (<HelpScreen></HelpScreen>);
        break;

      case taskpaneStatus.CREATE:
        const step = this.state.step;
        // If a saga project exists, we shouldn't do any of this
    
        if (step === 0) {
          toReturn = (
            <LoginScreen setEmail={this.setEmail} nextStep={this.nextStep}/>
          );
        } else if (step === 1) {
          toReturn = (
            <ProjectSourceScreen offline={this.offline} email={this.state.email} setURL={this.setURL} nextStep={this.nextStep}/>
          );
        } else if (step === 2) {
          toReturn = (
            <div className="taskpane">
              <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Creating your saga project..." />
            </div>
          );
        } else {
          // If the user has finished the creation process
          toReturn = (
            <LinkScreen remoteURL={this.state.remoteURL}></LinkScreen>
          );
        }
    }

    
    return (
      <StatusContext.Provider value={{status: this.state.taskpaneStatus, setStatus: this.setTaskpaneStatus}}>
        {toReturn}
      </StatusContext.Provider>
    )
  }  
}
