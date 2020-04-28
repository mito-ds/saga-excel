import * as React from "react";
import Taskpane from "../Taskpane";

/* global  */

export default class MergeForkedScreen extends React.Component {

  constructor(props) {
    super(props); 
  }


  render() {
    return (
      <Taskpane title="Looks like you started merging at the same time as one of your teammates. We don't support that right now.">
        <div className="forked-resolution-text-div">
          <p className="forked-resolution-text-title"> To resolve this issue: </p>
          <div className="forked-resolution-text">
            <p> 1. Copy your changes</p>
            <p> 2. Close your Excel workook and use the Saga sharing link to redownload this project </p>
            <p> 3. Apply the changes to your personal version </p>
            <p> 4. Merge</p>
          </div>
        </div>
      </Taskpane>
    )
  }
}
