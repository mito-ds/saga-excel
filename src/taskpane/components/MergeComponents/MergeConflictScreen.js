import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";
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
        resolutions: [],
    }

    this.resolveConflicts = this.resolveConflicts.bind(this)

  }

  resolveConflicts(e) {
    e.preventDefault();
    let resolutions = {}

    console.log("resolving conflicts")
    
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
        }

        // create the resolution object
        const resolution = {
            cell: conflict.cell, 
            value: selection
        }

        // Add resolution to resolutions list in the correct sheet entry 
        if (conflict.sheet in resolutions) {
            resolutions.sheetName.push(resolution)
        } else {
            resolutions[conflict.sheet] = [resolution]
        }

        // Send resolution data to update the sheets
        runResolveMergeConflicts(resolutions)
        
        
    })
    this.setState({resolutions: resolutions});
    console.log("RESOLUTIONS")
    console.log(resolutions)
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
        <div className="conflict-card-div">
            <form onSubmit={this.resolveConflicts}>
                <div className="scrollable-div">
                    {mergeConflictComponentsArray}
                </div>
                <PrimaryButton className="resolve-conflicts-button" type="submit">Submit</PrimaryButton>
            </form>
        </div>
      </Taskpane>
    )
  }
}
