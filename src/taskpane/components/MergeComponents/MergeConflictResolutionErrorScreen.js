import * as React from "react";
import Taskpane from "../Taskpane";
import { headerSize, mergeState } from "../../../constants";
import { PrimaryButton } from '@fluentui/react';
import { runRevertToCommitAndBranch } from "../../../saga/sagaUtils";
import { runResolveMergeConflicts }  from "../../../saga/merge";


// Login Form Component
export default class MergeConflictResolutionErrorScreen extends React.Component {
    constructor(props) {
        super(props); 
        this.retryResolution = this.retryResolution.bind(this);
    }

    async retryResolution(e) {
        e.preventDefault();

        // if we are able to reset the state, do so
        if (this.props.resolutionRetryObj.safetyCommit !== undefined && this.props.resolutionRetryObj.safetyBranch !== undefined) {
            await runRevertToCommitAndBranch(this.props.resolutionRetryObj.safetyCommit, this.props.resolutionRetryObj.safetyBranch);
        }
        
        // display merge in progress
        window.app.setMergeState({status: mergeState.MERGE_IN_PROGRESS, conflicts: null});
    
        // resolve merge conflicts
        const result = await runResolveMergeConflicts(this.props.resolutionRetryObj.resolutions);

        // TODO: Decide what to do if it fails again!
    
        // display success screen
        window.app.setMergeState(result.operationResult);
      }

    render () {
        return (
            <Taskpane header={headerSize.Small} title="It looks like you were still editing the spreadsheet">
                <div className="card-div">
                    <p> We can't understand the changes that you made if you're still making them! To continue working: </p>
                    <p> 1. Make sure you're not in cell editing mode. Hint: clicking on this text should do the trick!</p>
                    <p> 2. Click "Retry" below. </p>
                    <div className="reset-button-div"> 
                        <PrimaryButton className="reset-button" type="button" onClick={(e) => this.retryResolution(e)}>Retry</PrimaryButton> 
                    </div>
                </div>
            </Taskpane>
        ); 
    }
}