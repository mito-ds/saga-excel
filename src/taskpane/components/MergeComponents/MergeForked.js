import * as React from "react";

/* global  */

export default class MergeForked extends React.Component {

  constructor(props) {
    super(props); 
  }


  render() {
    return (
      <section className="ms-welcome__progress ms-u-fadeIn500">

        <div className="header">
          <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
        </div>

        <div className="merge-result-text">
          <p className="title-text" id="title-text">We were unable to merge your changes because you tried to merge at the same time as one of your teamates. This error will be fixed in later releases.</p>        
        </div>

        <div className="forked-resolution-text-div">
          <p className="forked-resolution-text-title"> To resolve this issue: </p>
          <div className="forked-resolution-text">
            <p> 1. Copy your changes</p>
            <p> 2. Close your Excel workook and use the Saga sharing link to redownload this project </p>
            <p> 3. Apply the changes to your personal version </p>
            <p> 4. Merge</p>
          </div>
        </div>
      </section>
    )
  }
}
