import * as React from "react";
import Progress from "./Progress";
import EmptyButton from "./saga/EmptyButton";
import CreateFromRemoteForm from './saga/CreateFromRemoteForm'
import ResetPersonalButton from './saga/ResetPersonalButton'
import {runCreateSaga, setPersonalBranchName, getRemoteURLFromTaskpane}  from "../../saga/create";
import {runSwitchVersionFromRibbon} from "../../saga/checkout"
import SagaLinkScreen from "./SagaLinkScreen"
import CreateSagaProjectScreen from "./CreateSagaProjectScreen"
import axios from "axios";

import './App.css';


/* global Excel */

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

var g = getGlobal();
g.events = [];

function formattingHandler(event) {
  g.events.push(event);
}

Office.onReady(() => {
  Excel.run(function (context) {
    context.workbook.worksheets.onFormatChanged.add(formattingHandler);
    return context.sync();
  })
});

function registerFormattingHandler () {
  
}


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      listItems: [], 
      firstTime: true,
      remoteURL: ''
    };

    this.doneCreate = this.doneCreate.bind(this);
  }

    
  doneCreate = (remoteURL) => {
    this.setState({firstTime: false, remoteURL: remoteURL})
  }

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Please sideload your addin to see app body." />
      );
    }
    if (this.state.firstTime) {
      return (
        <div className="taskpane">
          <CreateSagaProjectScreen doneCreate={this.doneCreate}></CreateSagaProjectScreen>
          <div className="footer">
            <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagalab.org/">FAQ</a></b></p>
            <p className="subtext disclaimer"> Saga is in pre-alpha stage. Use this tool knowing your data may be lost. </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="taskpane">
          <SagaLinkScreen remoteURL={this.state.remoteURL}></SagaLinkScreen>
          <div className="footer">
            <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagalab.org/">FAQ</a></b></p>
            <p className="subtext disclaimer"> Saga is in pre-alpha stage. Use this tool knowing your data may be lost. </p>
          </div>
        </div>
      );
    }  
  }
}
