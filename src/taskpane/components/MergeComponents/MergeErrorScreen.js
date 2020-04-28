import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import axios from "axios";
import Taskpane from "../Taskpane";


/* global  */

export default class MergeErrorScreen extends React.Component {

  constructor(props) {
    super(props); 

    this.postFeedback = this.postFeedback.bind(this)
  }

  postFeedback (e) {
    e.preventDefault();
    const email = document.getElementById('email').value
    const response = document.getElementById('response').value

    try {
        // Send the feedback to the server
        axios.post(
            "https://excel.sagacollab.com/submit-feedback",
            {
                email: email,
                relevance: "A bug",
                response: response
            }
        )
    } catch (error) {
        console.error("Failed to post email.")
    }
    
   // Remove Signup form, display thank you text 
   document.getElementById('project-link-card').style.display = "none"
   document.getElementById('feedback-thank-you').style.display = "block"

  }

  render() {
    return (
      <Taskpane title="Uh oh! We hit an error while merging your worksheets. Let us know what you were working on so we can improve merge in the future!">
        <div className="floating-card" id="project-link-card">
          <h1 className="feedback-form-title">Feedback</h1>
          <form className="form" id="feedback-form" onSubmit={this.postFeedback}>
              <input className="project-link-div input" type="email" placeholder="email" id="email"></input>
              <textarea className="feedback" type="text" placeholder="feedback" id="response" style={{"paddingBottom": "2vh"}}></textarea>
              <PrimaryButton className="submit-button center" type="submit">Submit</PrimaryButton>
          </form>
        </div>
        <div className="floating-card" id="feedback-thank-you" style={{display:"none", "backgroundColor": "#e6ffb3", padding: "3vh"}}>
          <p style={{textAlign: "center"}}>Thanks for your feedback!</p>
        </div>
      </Taskpane>
    )
  }
}
