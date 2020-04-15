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


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      listItems: [], 
      firstTime: true,
      remoteURL: ''
    };

    this.clearEvents = this.clearEvents.bind(this);
    this.formattingHandler = this.formattingHandler.bind(this);
    this.registerFormattingHandler = this.registerFormattingHandler.bind(this);
    this.doneCreate = this.doneCreate.bind(this);
  }

  clearEvents = (event) => {
    this.setState({events: []});
  }

  formattingHandler = (event) => {
    this.setState((state, props) => {
      const newEvents = state.events.concat([event]);
      return {events: newEvents};
    });
  }

  registerFormattingHandler = async () => {
    var handler = this.formattingHandler;
    await Excel.run(function (context) {
      context.workbook.worksheets.onFormatChanged.add(handler);
      return context.sync();
    })
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
          <EmptyButton function={this.registerFormattingHandler} message={"register"}/>
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
          <EmptyButton function={registerFormattingHandler} message={"register"}/>
          <div className="footer">
            <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagalab.org/">FAQ</a></b></p>
            <p className="subtext disclaimer"> Saga is in pre-alpha stage. Use this tool knowing your data may be lost. </p>
          </div>
        </div>
      );
    }  
  }
}
