import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Taskpane from "../Taskpane";
import { headerSize, mergeState } from "../../../constants";
import MergeConflict from "./MergeConflict";
import { runResolveMergeConflicts }  from "../../../saga/merge";
 


import './MergeConflictScreen.css';

/* global  */

function numToChar (number) {
    var numeric = (number - 1) % 26;
    var letter = chr(65 + numeric);
    var number2 = parseInt((number - 1) / 26);
    if (number2 > 0) {
        return numToChar(number2) + letter;
    } else {
        return letter;
    }
}

function chr(codePt) {
    if (codePt > 0xFFFF) { 
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    return String.fromCharCode(codePt);
}

// Take from https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25

export default class MergeErrorScreen extends React.Component {

  constructor(props) {
    super(props); 

    // Format Conflict Data
    const mergeData = Object.entries(this.props.conflicts);
    console.log(mergeData)
    
    let conflictsArray = []
    mergeData.forEach((conflictData) => {
        const sheet = conflictData[0];
        const column = numToChar(conflictData[1].conflicts[0].colIndex + 1);
        const row = conflictData[1].conflicts[0].rowIndex + 1;
        const cell = column + row;
        const a = conflictData[1].conflicts[0].a;
        const b = conflictData[1].conflicts[0].b;
        const o = "PLACE HOLDER ORIGINAL";
        
        const conflict = {sheet: sheet, cell: cell, a: a, b: b, o: o}
        conflictsArray.push(conflict)
    });

    this.state = {
        conflicts: conflictsArray,
        resolutions: {},
    }

    this.collectResolutions = this.collectResolutions.bind(this)
    this.executeResolutions = this.executeResolutions.bind(this)
    this.hideWarningBox = this.hideWarningBox.bind(this)
  }

  collectResolutions(e) {
    e.preventDefault();
    var collectedResolutions = {}
    let usingDefault = false
    
    this.state.conflicts.forEach(function(conflict) {

        // Get user's selection from the conflict component
        const cellID = conflict.sheet + ":" + conflict.cell
        const selectedButton = document.querySelector('input[name="' + cellID + '"]:checked');

        // If the user selected an option, use that. Otherwise, default to a
        // TODO: Warn user of default setting
        let selection = ""
        if (selectedButton !== null) {
            selection = selectedButton.value;
        } else {
            selection = conflict.a
            usingDefault = true
        }

        // create the resolution object
        const resolution = {
            cell: conflict.cell, 
            value: selection
        }

        // Add resolution to resolutions list in the correct sheet entry 
        if (conflict.sheet in collectedResolutions) {
            collectedResolutions.sheetName.push(resolution)
        } else {
            collectedResolutions[conflict.sheet] = [resolution]
        }        
        
    });

    this.setState({resolutions: collectedResolutions});

    if (usingDefault) {
        document.getElementById("warning-div").style.display = "block";
        return;
    } else {
        this.executeResolutions(collectedResolutions)
    }
  }

  async executeResolutions (resolutions) {
    // Send resolution data to update the sheets
    document.getElementById("warning-div").style.display = "none";

    // display merge in progress
    window.app.setMergeState({status: mergeState.MERGE_IN_PROGRESS, conflicts: null});

    console.log(resolutions)
    // resolve merge conflicts
    const mergeResult = await runResolveMergeConflicts(resolutions)

    // display success screen
    window.app.setMergeState(mergeResult);
  }

  hideWarningBox (e) {
    e.preventDefault()
    document.getElementById("warning-div").style.display = "none";
  }
    
  render() {
    
    let mergeConflictComponentsArray = []
    this.state.conflicts.forEach(function(conflict) {
        mergeConflictComponentsArray.push(<MergeConflict conflict={conflict}></MergeConflict>)
    });

    return (
      <Taskpane header={headerSize.SMALL} title="You need to resolve merge conflicts before your merge can finish">
        <div className="title-subtext-div">
            <div className="title-subtext">Pick which version of the cell you want to keep. They are ordered: <b>yours, collaborator’s, original</b>.</div>
        </div>
        <div className="warning-div" id="warning-div">
            <p><b>Warning</b>: You didn't resolve all of the merge conflicts. Either continue resolving them or use the values in the main version of the project to resolve the remaining conflicts </p>
            <div className="warning-box-button-div">
                <PrimaryButton className="warning-box-button" type="button" onClick={(e) => this.executeResolutions(this.state.resolutions)}>Use Main Version</PrimaryButton>
                <PrimaryButton className="warning-box-button" type="button" onClick={(e) => this.hideWarningBox(e)}>Finish Resolving</PrimaryButton>
            </div>
        </div>
        <div className="conflict-card-div">
            <form onSubmit={this.collectResolutions}>
                <div className="scrollable-div">
                    {mergeConflictComponentsArray}
                </div>
                <div className="submit-button-div"> 
                    <PrimaryButton className="submit-button" type="submit">Submit</PrimaryButton>
                </div>
            </form>
        </div>
      </Taskpane>
    )
  }
}
