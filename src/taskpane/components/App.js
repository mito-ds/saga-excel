import * as React from "react";
import Progress from "./Progress";
import EmptyButton from "./saga/EmptyButton";
import {runCreateSaga, setPersonalBranchName, getRemoteURLFromTaskpane}  from "../../saga/create";
import {runSwitchVersionFromRibbon} from "../../saga/checkout"
import SagaLinkScreen from "./SagaLinkScreen"
import CreateSagaProjectScreen from "./CreateSagaProjectScreen"

//import { updateShared } from "./saga/sync";

import './App.css';

/* global Excel */

var formattingEvents = [];

function formattingHandler(event) {
  formattingEvents.push(event);
  console.log(formattingEvents);
}

function registerFormattingHandler() {
  Excel.run(function (context) {
    context.workbook.worksheets.onChanged.add(formattingHandler);
    return context.sync();
  })
}

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: [], 
      firstTime: true,
      remoteURL: ''
    };
    this.doneCreate = this.doneCreate.bind(this);
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
          <EmptyButton function={registerFormattingHandler} message={"register"}/>
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
