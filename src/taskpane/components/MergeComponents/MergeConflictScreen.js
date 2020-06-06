import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Taskpane from "../Taskpane";
import { headerSize, mergeState, operationStatus } from "../../../constants";
import MergeConflict from "./MergeConflict";
import { runResolveMergeConflicts }  from "../../../saga/merge";
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { runRevertToCommitAndBranch } from "../../../saga/sagaUtils";


import './MergeConflictScreen.css';

/* global  */

export default class MergeConflictScreen extends React.Component {

  constructor(props) {
    super(props); 

    this.state = {
        mergeConflictData: this.props.mergeConflictData,
        resolutions: {},
        default: "default", 
        safetyCommit: null,
        safetyBranch: null,
        mergeConflictResolutionError: false

    };

    this.collectResolutions = this.collectResolutions.bind(this);
    this.executeResolutions = this.executeResolutions.bind(this);
    this.hideWarningBox = this.hideWarningBox.bind(this);
    this.onChanged = this.onChanged.bind(this);
  }


  // Highlights the conflict options on batch select
  onChanged(checked) {
    // TODO: Check this value without converting to a string
    const isDefaultPersonal = document.getElementById("default-toggle").getAttribute('aria-checked').toString();

    this.state.mergeConflictData.forEach(function(sheetResults) {
        sheetResults.conflicts.forEach(function(conflict) {

            const cellID = conflict.sheet + ":" + conflict.cellOrRow;

            if (isDefaultPersonal === "true") {
                const optionToSelect = document.getElementById(cellID + "b");
                optionToSelect.checked = true;
            }

            if (isDefaultPersonal === "false") {
                const optionToSelect = document.getElementById(cellID + "a");
                optionToSelect.checked = true;
            }
        });
    });
  }

  collectResolutions(e) {
    e.preventDefault();
    var collectedResolutions = {};
    let usingDefault = false;

    // TODO: Check this value without converting to a string
    const isDefaultPersonal = document.getElementById("default-toggle").getAttribute('aria-checked').toString() === "true";

    this.setState({default: isDefaultPersonal? "your changes" : "your collaborator's changes"});

    this.state.mergeConflictData.forEach(function(sheetResults) {
        sheetResults.conflicts.forEach(function(conflict) {

            // Get user's selection from the conflict component
            const cellID = conflict.sheet + ":" + conflict.cellOrRow;
            const selectedButton = document.querySelector('input[name="' + cellID + '"]:checked');

            // If the user selected an option, use that. Otherwise default
            let selection = "";
            if (selectedButton !== null) {
                selection = selectedButton.value;
            } else if (isDefaultPersonal) {
                selection = conflict.b;
                usingDefault = true;
            } else {
                selection = conflict.a;
                usingDefault = true;
            }

            // create the resolution object
            const resolution = {
                cellOrRow: conflict.cellOrRow, 
                value: selection
            };

            // Add resolution to resolutions list in the correct sheet entry 
            if (!(conflict.sheet in collectedResolutions)) {
                collectedResolutions[conflict.sheet] = [];
            }

            collectedResolutions[conflict.sheet].push(resolution);
        });
    });

    // save the resolutions
    this.setState({resolutions: collectedResolutions});

    if (usingDefault) {
        // If not all conflicts were resolved, display warning
        document.getElementById("warning-div").style.display = "block";
        return;
    } else {
        // If all conflicts are resolved, execute them
        this.executeResolutions(collectedResolutions);
    }
  }

  async executeResolutions (resolutions) {

    document.getElementById("warning-div").style.display = "none";

    // display merge in progress
    window.app.setMergeState({status: mergeState.MERGE_IN_PROGRESS, conflicts: null});

    // resolve merge conflicts
    const result = await runResolveMergeConflicts(resolutions);

    // if conflict resolution was successful, show success screen
    if (result.status === operationStatus.SUCCESS) {
        window.app.setMergeState(result.operationResult);
        return;
    }
    
    this.props.setResolutionRetryObj({
        resolutions: resolutions,
        safetyCommit: result.safetyCommit,
        safetyBranch: result.safetyBranch
    });

    window.app.setMergeState({ status: mergeState.MERGE_CONFLICT_RESOLUTION_ERROR});

  }

  hideWarningBox (e) {
    e.preventDefault();
    document.getElementById("warning-div").style.display = "none";
  }
    
  render() {
    
    let mergeConflictComponentsArray = [];
    console.log(this.state.mergeConflictData);
    this.state.mergeConflictData.forEach(function(sheetResults) {
        sheetResults.conflicts.forEach(function(conflict) {
            mergeConflictComponentsArray.push(<MergeConflict conflict={conflict}></MergeConflict>);
        });
    });

    return (
      <Taskpane header={headerSize.SMALL} title="You need to resolve merge conflicts before your merge can finish">
        <div className="title-subtext-div">
            <div className="title-subtext">Choose which changes to keep - they're ordered: <br></br> <b>Yours, Collaborator's, Original</b></div>
        </div>
        <div className="warning-div" id="warning-div">
            <p><b>Warning</b>: You didn't resolve all of the merge conflicts, so we're using {this.state.default}.</p>
            <div className="warning-box-button-div">
                <PrimaryButton className="warning-box-button" type="button" onClick={(e) => this.hideWarningBox(e)}>Finish Resolving</PrimaryButton>
                <PrimaryButton className="warning-box-button" type="button" onClick={(e) => this.executeResolutions(this.state.resolutions)}>Use Default</PrimaryButton>
            </div>
        </div>
        <div className="conflict-card-div">
            <div className="batch-toggle-div">
                <Toggle className="toggle" id="default-toggle" label="Batch Select" inlineLabel onText="Collaborator's Changes" offText="Your Changes" onChange={this.onChanged} />
            </div>
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
    );
  }
}
