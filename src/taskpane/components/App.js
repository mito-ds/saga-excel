import * as React from "react";
import log from "loglevel";
import prefix from 'loglevel-plugin-prefix';
import Progress from "./Progress";
import LinkScreen from "./LinkScreen"
import LoginScreen from "./LoginScreen"
import ProjectSourceScreen from "./ProjectSourceScreen"
import TaskpaneFooter from "./TaskpaneFooter"
import OfflineErrorScreen from "./OfflineErrorScreen"
import DevScreen from "./DevScreen";
import MergeScreen from "./MergeScreen";
import { StatusContext } from "./StatusContext";
import { taskpaneStatus, mergeState } from "../../constants";
import { sagaProjectExists, sagaProjectJSON } from "../../saga/sagaUtils";
import { getGlobal } from "../../commands/commands";


import './App.css';

/* global */

/*
  Setup logging
*/
prefix.reg(log);
log.enableAll();

prefix.apply(log, {template: '[%t] %l :'});
const appLogger = log.getLogger('app');


// Setup logging


/*
  Log specification: 
*/

function setupLogs() {

  prefix.apply(appLogger, {
    template: '[%t] %l [app]'
  });

  log.info("initalizing app");
}

export default class App extends React.Component {
  constructor(props) {
    // We apply the first log template
    setupLogs();

    super(props);
    this.state = {
      step: 0,
      email: '',
      remoteURL: '',
      offline: false,
      taskpaneStatus: taskpaneStatus.CREATE,
      mergeState: mergeState.MERGE_SUCCESS
    };

    this.getTaskpaneStatus = this.getTaskpaneStatus.bind(this);
    this.setTaskpaneStatus = this.setTaskpaneStatus.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.offline = this.offline.bind(this);
    this.getMergeState = this.getMergeState.bind(this);
    this.setMergeState = this.setMergeState.bind(this);

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
    log.getLogger('app').info(`taskpaneState=${taskpaneStatus}`);
    this.setState({taskpaneStatus: taskpaneStatus})
  }

  getMergeState = () => {
    return this.state.mergeState;
  }

  setMergeState = (mergeState) => {
    log.getLogger('app').info(`mergeState=${mergeState}`);
    this.setState({mergeState: mergeState})
  }

  setEmail = (email) => {
    log.getLogger('app').info(`email=${email}`);
    this.setState({email: email})
    getGlobal().email = email;
  }
    
  setURL = (remoteURL) => {
    log.getLogger('app').info(`remoteURL=${remoteURL}`);
    this.setState({remoteURL: remoteURL})
    getGlobal().remoteURL = remoteURL;
  }

  offline = () => {
    this.setState({offline: true})
  }
  
  nextStep = () => {
    log.getLogger('app').info(`step=${this.state.step}`);
    this.setState(state => {
      return {step: state.step + 1}
    })
  }

  render() {
    const { title, isOfficeInitialized } = this.props;

    // TODO: check if office is initialized, and that we are online
    var toReturn;

    switch(this.state.taskpaneStatus) {
      case taskpaneStatus.DEVELOPMENT:
        toReturn = (<DevScreen/>);
        break;

      case taskpaneStatus.MERGE:
        toReturn = (<MergeScreen mergeState={this.state.mergeState}/>);
        break;

      case taskpaneStatus.SHARE:
        toReturn = (<LinkScreen remoteURL={this.state.remoteURL}/>);
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
