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
            changeType: "Modified", 
            changes: [
                {
                    sheet: "Sheet1",
                    cell: "A1",
                    initialValue: "55",
                    finalValue: "60"
                },
                {
                    sheet: "Sheet1",
                    cell: "B1",
                    initialValue: "10",
                    finalValue: "100"
                }
            ]
        },
        {
            sheet: "Sheet2", 
            changeType: "Inserted", 
            changes: []
        },
        {
            sheet: "Sheet3", 
            changeType: "None", 
            changes: []
        },
        {
            sheet: "Sheet4", 
            changeType: "Deleted", 
            changes: []
        },
    ]
}

export default class DiffScreen extends React.Component {

  constructor(props) {
    super(props); 

    this.state = {
        diffs: props.changes || []
    }
  }
    
  render() {

    const diffs = this.state.diffs;

    let sheetComponents = [];
    diffs.forEach((sheetDiff) => {
        sheetComponents.push(
            <DiffSheet key={sheetDiff.sheetName} sheetDiff={sheetDiff}/>
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
