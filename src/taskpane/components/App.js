import * as React from "react";
import Progress from "./Progress";
import SagaLinkScreen from "./SagaLinkScreen"
import LoginScreen from "./LoginScreen"
import ProjectSourceScreen from "./ProjectSourceScreen"
import TaskpaneFooter from "./TaskpaneFooter"

import './App.css';


/* global */

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      email: '',
      remoteURL: ''
    };

    this.setEmail = this.setEmail.bind(this);
    this.setURL = this.setURL.bind(this);
    this.nextStep = this.nextStep.bind(this);
  }

  setEmail = (email) => {
    this.setState({email: email})
  }

    
  setURL = (remoteURL) => {
    this.setState({remoteURL: remoteURL})
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
          <ProjectSourceScreen email={this.state.email} setURL={this.setURL} nextStep={this.nextStep}/>
          <TaskpaneFooter/>
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
