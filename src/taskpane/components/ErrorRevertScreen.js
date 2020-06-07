
import * as React from "react";
import Taskpane from "./Taskpane";
import { runRevertToCommitAndBranch } from "../../saga/sagaUtils";
import { headerSize, taskpaneStatus } from "../../constants";
import { PrimaryButton } from '@fluentui/react';

export default class ErrorRevertScreen extends React.Component {
    constructor(props) {
        super(props); 

        this.reset = this.reset.bind(this);
    }

    async reset(e) {
        e.preventDefault();
        await runRevertToCommitAndBranch(this.props.safetyCommit, this.props.safetyBranch);

        // TODO: Create a success screen or default project management screen
        window.app.setTaskpaneStatus(taskpaneStatus.SHARE); 
    }

    render () {
        return (
            <Taskpane header={headerSize.SMALL} title="It looks like you were still editting the spreadsheet">
                <div className="card-div">
                    <p> 1. Make sure you're not in cell edittng mode. Hint: clicking on this text should do the trick!</p>
                    <p> 2. Click on the reset button below. </p>
                    <p> 3. Try your operation again. </p>
                    <div className="reset-button-div"> 
                        <PrimaryButton className="reset-button" type="button" onClick={(e) => this.reset(e)}>Reset</PrimaryButton> 
                    </div>
                </div>
            </Taskpane>
        ); 
    }
}