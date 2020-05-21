import * as React from "react";
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";
import DiffSheet from "./DiffSheet";
import "./DiffScreen.css";

/* global  */

function getDiff() {
    return [
        {
            sheet: "Sheet1", 
            changeType: "modified", 
            changes: [{
                sheet: "sheet1",
                cell: "A1",
                initialElement: "55",
                finalElement: "60"
            }]
        },
        {
            sheet: "Sheet2", 
            changeType: "inserted", 
            changes: []
        },

    ]
}

export default class DiffScreen extends React.Component {

  constructor(props) {
    super(props); 

    this.state = {
        diffs: getDiff()
    }
  }
    
  render() {

    const diffs = this.state.diffs;

    let sheetComponents = [];
    diffs.forEach((sheetDiff) => {
        sheetComponents.push(
            <DiffSheet key={sheetDiff.sheet} sheetDiff={sheetDiff}/>
        )  
    })


    return (
      <Taskpane header={headerSize.SMALL} title="Recent Changes">
        <div className="title-subtext-div">
            <div className="title-subtext">Everything that has changed in the shared version since you last looked.</div>
        </div>
        <div className="diff-card-div">
            <div className="scrollable-div">
                {sheetComponents}
            </div>
        </div>
      </Taskpane>
    )
  }
}
