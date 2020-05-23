import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Taskpane from "../Taskpane";
import { headerSize, mergeState } from "../../../constants";
import MergeConflict from "./MergeConflict";
import { runResolveMergeConflicts }  from "../../../saga/merge";
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';


import './MergeConflictScreen.css';

/* global  */

export default class MergeConflictScreen extends React.Component {

  constructor(props) {
    super(props); 

    this.state = {
        mergeConflictData: this.props.mergeConflictData,
        resolutions: {}
    }

    this.collectResolutions = this.collectResolutions.bind(this)
    this.executeResolutions = this.executeResolutions.bind(this)
    this.hideWarningBox = this.hideWarningBox.bind(this)
  }

  collectResolutions(e) {
    e.preventDefault();
    var collectedResolutions = {}
    let usingDefault = false
    
    this.state.mergeConflictData.forEach(function(sheetResults) {
        sheetResults.conflicts.forEach(function(conflict) {
            console.log(conflict)

            // Get user's selection from the conflict component
            const cellID = conflict.sheet + ":" + conflict.cellOrRow
            const selectedButton = document.querySelector('input[name="' + cellID + '"]:checked');

            // If the user selected an option, use that. Otherwise, default to option a
            let selection = ""
            if (selectedButton !== null) {
                selection = selectedButton.value;
            } else {
                selection = conflict.a
                usingDefault = true
            }

            // create the resolution object
            const resolution = {
                cellOrRow: conflict.cellOrRow, 
                value: selection
            }

            // Add resolution to resolutions list in the correct sheet entry 
            if (conflict.sheet in collectedResolutions) {
                collectedResolutions.sheetName.push(resolution)
            } else {
                collectedResolutions[conflict.sheet] = [resolution]
            }
        });
    });

    // save the resolutions
    this.setState({resolutions: collectedResolutions})

    if (usingDefault) {
        // If not all conflicts were resolved, display warning
        document.getElementById("warning-div").style.display = "block";
        return;
    } else {
        // If all conflicts are resolved, execute them
        this.executeResolutions(collectedResolutions)
    }
  }

  async executeResolutions (resolutions) {
    const checked = document.getElementById("default-toggle").getAttribute('aria-checked').toString()

    //TODO: Fix bad practice
    console.log(checked === "true")

    // Send resolution data to update the sheets
    document.getElementById("warning-div").style.display = "none";

    // display merge in progress
    window.app.setMergeState({status: mergeState.MERGE_IN_PROGRESS, conflicts: null});

    console.log(this.state.resolutions)

    this.state.mergeConflictData.forEach(function(sheetResults) {
        sheetResults.conflicts.forEach(function(conflict) {
            console.log(conflict)
        })
    });

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
    console.log(this.state.mergeConflictData)
    this.state.mergeConflictData.forEach(function(sheetResults) {
        sheetResults.conflicts.forEach(function(conflict) {
            mergeConflictComponentsArray.push(<MergeConflict conflict={conflict}></MergeConflict>)
        });
    });

    return (
      <Taskpane header={headerSize.SMALL} title="You need to resolve merge conflicts before your merge can finish">
        <div className="title-subtext-div">
            <div className="title-subtext">There are to ways to resolve merge conflicts. </div>
            <div className="title-subtext">1. Pick which version of the cell you want to keep. They are ordered: <b>yours, collaborator’s, original</b>.</div>
            <div className="title-subtext">2. Click the submit button and batch accept either the personal version or the main verion.</div>
        </div>
        <div className="warning-div" id="warning-div">
            <p><b>Warning</b>: You didn't resolve all of the merge conflicts. Either continue resolving them or use the values in the main version of the project to resolve the remaining conflicts </p>
            <div className="warning-box-button-div">
                <PrimaryButton className="warning-box-button" type="button" onClick={(e) => this.hideWarningBox(e)}>Finish Resolving</PrimaryButton>
                <PrimaryButton className="warning-box-button" type="button" onClick={(e) => this.executeResolutions(this.state.resolutions)}>Use Main Version</PrimaryButton>
            </div>
        </div>
        <div className="conflict-card-div">
            <form onSubmit={this.collectResolutions}>
                <div className="scrollable-div">
                    {mergeConflictComponentsArray}
                </div>
                <div className="batch-toggle-div">
                    <Toggle className="toggle" id="default-toggle" label="Select default changes" inlineLabel onText="Your Changes" offText="Main Version" />
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
