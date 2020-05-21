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
            changes: [
                {
                    sheet: "Sheet1",
                    cell: "A1",
                    initialElement: "55",
                    finalElement: "60"
                },
                {
                    sheet: "Sheet1",
                    cell: "B1",
                    initialElement: "10",
                    finalElement: "100"
                }
            ]
        },
        {
            sheet: "Sheet2", 
            changeType: "inserted", 
            changes: []
        },
        {
            sheet: "Sheet3", 
            changeType: "none", 
            changes: []
        },
        {
            sheet: "Sheet4", 
            changeType: "deleted", 
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
