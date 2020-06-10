import * as React from "react";
import Progress from "./Progress";
import LinkScreen from "./LinkScreen";
import LoginScreen from "./LoginScreen";
import ProjectSourceScreen from "./ProjectSourceScreen";
import ErrorRevertScreen from "./ErrorRevertScreen";
import SwitchScreen from "./SwitchScreen";
import DiffScreen from "./DiffComponents/DiffScreen";
import { OutOfDateErrorScreen, logOutOfDate } from "./OutOfDateErrorScreen";
import DevScreen from "./DevScreen";
import MergeScreen from "./MergeScreen";
import { StatusContext } from "./StatusContext";
import { MultiplayerScenarioContext } from "./MultiplayerScenarioContext";
import { taskpaneStatus, mergeState, operationStatus } from "../../constants";
import { sagaProjectJSON } from "../../saga/sagaUtils";
import { turnSyncOnAndUnpause }from "../../saga/sync";
import { runMerge } from "../../saga/merge";
import { runResetPersonalVersion } from "../../saga/resetPersonal";

import './App.css';

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
      safetyCommit: null,
      safetyBranch: null,
      branch: "personal",
      scenario: null
    };

    this.setStep = this.setStep.bind(this);
    this.getTaskpaneStatus = this.getTaskpaneStatus.bind(this);
    this.setTaskpaneStatus = this.setTaskpaneStatus.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.offline = this.offline.bind(this);
    this.merge = this.merge.bind(this);
    this.resetPersonalVersion = this.resetPersonalVersion.bind(this);
    this.getMergeState = this.getMergeState.bind(this);
    this.setMergeState = this.setMergeState.bind(this);
    this.setSheetDiffs = this.setSheetDiffs.bind(this);
    this.setSafetyValues = this.setSafetyValues.bind(this);
  }

  /*
    If there is a saga project already, we load it into the taskpane,
    and turn sync on
  */
  async componentDidUpdate(prevProps) {
    if (!prevProps.isOfficeInitialized && this.props.isOfficeInitialized) {
      const projectObj = await sagaProjectJSON();
      if (("remoteURL" in projectObj)) {
        this.setURL(projectObj["remoteURL"]);
        this.setEmail(projectObj["email"]);
        this.setTaskpaneStatus(taskpaneStatus.SHARE);
        // Turn syncing if there is a saga project
        turnSyncOnAndUnpause();
      }
    }
  }

  // If the operation errored and requires manual resolution, display screen
  checkResultForError(result) {
    console.log("Checking error in ", result);
    // if the safetyCommit and safetyBranch are undefined, then we are in the correct state if the user deletes extra sheets
    if (result.status === operationStatus.ERROR_MANUAL_FIX && result.safetyCommit !== undefined && result.safetyBranch !== undefined) {
      this.setState({
        taskpaneStatus: taskpaneStatus.ERROR_MANUAL_FIX,
        safetyCommit: result.safetyCommit,
        safetyBranch: result.safetyBranch
      })
      Office.addin.showAsTaskpane();
      return true;
    }
    
    // if cell editting mode error occurs before safety commit and safety branch
    if (result.status === operationStatus.ERROR_MANUAL_FIX || result.status === operationStatus.ERROR_AUTOMATICALLY_FIXED) {
      // TODO take to notification
      return true;
    }
    return false;
  }

  setStep = (step) => {
    this.setState({step: step});
  }

  getTaskpaneStatus = () => {
    return this.state.taskpaneStatus;
  }

  setTaskpaneStatus = (taskpaneStatus) => {
    console.log(`setting the value of taskpaneState to ${taskpaneStatus}`);
    this.setState({taskpaneStatus: taskpaneStatus});
  }

  getMergeState = () => {
    return this.state.mergeState;
  }

  merge = async (event) => {
    // Update the state for the start of the merge
    this.setState({
      taskpaneStatus: taskpaneStatus.MERGE,
      mergeState: mergeState.MERGE_IN_PROGRESS, 
      mergeConflictData: null
    });

    // Then, make sure the taskpane is open
    Office.addin.showAsTaskpane();

    console.log("running merge");
    var result = await runMerge([]);
    console.log("done running merge");

    if (!this.checkResultForError(result)) {
      console.log("Checked result for error, no error")
      this.setState({
        mergeState: result.operationResult.status, 
        mergeConflictData: result.operationResult.mergeConflictData
      });
    }

    // If this function was called by clicking the button, let Excel know it's done
    if (event) {
      event.completed();
    }

    events = [];
    return result.operationResult;
  }

  // TODO: debug this...
  resetPersonalVersion = async (event) => {
    // Todo: If on master, tell them they can't
    const result = await runResetPersonalVersion();
      
    this.checkResultForError(result); 
  
    if (event) {
      event.completed();
    }
  }

  setMergeState = (mergeState) => {
    this.setState({
      mergeState: mergeState.status, 
      mergeConflictData: mergeState.mergeConflictData
    });
  }

  setEmail = (email) => {
    this.setState({email: email});
  }
    
  setURL = (remoteURL) => {
    this.setState({remoteURL: remoteURL});
  }

  setSheetDiffs = (sheetDiffs) => {
    this.setState({sheetDiffs: sheetDiffs});
  }

  setBranch = (branch) => {
    this.setState({branch: branch});
  }

  setSafetyValues = (safetyCommit, safetyBranch) => {
    this.setState({
      safetyCommit: safetyCommit,
      safetyBranch: safetyBranch
    });
  }

  offline = () => {
    this.setState({offline: true});
  }
  
  nextStep = () => {
    this.setState(state => {
      return {step: state.step + 1}
    });
  }

  setScenario = (scenario) => {
    this.setState({
      scenario: scenario
    });
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
        toReturn = (<MergeScreen mergeState={this.state.mergeState} mergeConflictData={this.state.mergeConflictData} remoteURL={this.state.remoteURL}/>);
        break;

      case taskpaneStatus.SHARE:
        toReturn = (<LinkScreen remoteURL={this.state.remoteURL}/>);
        break;

      case taskpaneStatus.DIFF:
        toReturn = (<DiffScreen sheetDiffs={this.state.sheetDiffs}/>);
        break;

      case taskpaneStatus.SWITCH:
        toReturn = (<SwitchScreen branch={this.state.branch}/>);
        break;

      case taskpaneStatus.ERROR_MANUAL_FIX:
        toReturn = (<ErrorRevertScreen safetyCommit={this.state.safetyCommit} safetyBranch={this.state.safetyBranch}/>);
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
        <MultiplayerScenarioContext.Provider value={{scenario: this.state.scenario, setScenario: this.setScenario}}>
          {toReturn}
        </MultiplayerScenarioContext.Provider>
      </StatusContext.Provider>
    )
  }  
}
