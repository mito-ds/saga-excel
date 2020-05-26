import * as React from "react";
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";


/* global  */

export default class MergeForkedScreen extends React.Component {

  constructor(props) {
    super(props); 
  }


  render() {
    return (
      <Taskpane header={headerSize.LARGE} title="Looks like you started merging at the same time as one of your teammates. We don't support that right now.">
        <div className="forked-resolution-text-div">
          <p className="forked-resolution-text-title"> To resolve this issue: </p>
          <div className="forked-resolution-text">
            <p> 1. Keep this workbook open</p>
            <p> 1. Open a new workbook and redownload your saga project using the Saga sharing link: {this.state.remoteURL}</p>
            <p> 3. Copy and paste over any changes from your personal version to the new Excel workbook </p>
            <p> 4. Merge </p>
          </div>
        </div>
      </Taskpane>
    );
  }
}
