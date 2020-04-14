import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Progress from "./Progress";
import EmptyButton from "./saga/EmptyButton";
import {runCreateSaga} from "../../saga/create";
import Project from "../../saga/Project";



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

// Hide the project link card when window loads
function onload() {
  document.getElementById("project-link-card").style.display = "none";
}

// Create Saga Project
async function createSagaProject (e) {
  e.preventDefault();
  console.log("running create saga")
  const remoteURL = await runCreateSaga();

  //Todo: Set personal branch name
  
  // Switch Taskpane Cards
  document.getElementById('email-card').style.display = "none"
  document.getElementById("project-link-card").style.display = "block"
  document.getElementById("project-link").value = remoteURL;
  document.getElementById("title-text").innerText = "Send your Saga project link to your teamates to start collaborating"

}

// Copy project link to clipboard
function copyToClipboard(e) {
  e.preventDefault();
  var copyText = document.getElementById("project-link");
  copyText.select();
  document.execCommand("copy");
}



export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: []
    };
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

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/saga-logo/saga-logo-taskpane.png" message="Please sideload your addin to see app body." />
      );
    }
    return (
      <div className="taskpane">
        <div className="content">
          <div className="header">
            <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
            <p className="title-text" id="title-text" >You're almost ready to start collaborating - just tell your team who you are</p>
          </div>
          <div className="card-div">          
            <div className="floating-card" id="email-card">
              <p className="subtext">I’m using Saga knowing that it is in a pre-alpha stage. I understand that my data may be lost and <b>I will continue to backup my work.</b> </p>
              <form className="form" onSubmit={createSagaProject}>
                <input className="email-input" placeholder="example@gmail.com" type="email"></input>
                <PrimaryButton className="submit-button" type="submit">Submit</PrimaryButton>
              </form>
            </div>
            <EmptyButton function={registerFormattingHandler} message={"register"}/>
            <div className="floating-card" id="project-link-card" style={{display: "none"}}>
              <form className="form" onSubmit={copyToClipboard}>
                <input className="project-link-div" id="project-link" disabled></input>
                <input type="image" src="assets/clipboard.png" width="30vw" border="0" alt="Submit" />
              </form>
            </div>
          </div>
          
        </div>
        <div className="footer">
          <p className="FAQ-text"> <b>Have questions about Saga? See our <a href="https://sagalab.org/">FAQ</a></b></p>
          <p className="subtext disclaimer"> Saga is in pre-alpha stage. Use this tool knowing your data may be lost. </p>
        </div>
      </div>
    );
  }
}
