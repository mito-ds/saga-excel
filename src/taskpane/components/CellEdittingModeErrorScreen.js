import * as React from "react";
import Taskpane from "./Taskpane";
import { headerSize } from "../../constants";
import { PrimaryButton } from '@fluentui/react';
import { runCheckoutCommit } from "../../saga/checkout";


// Login Form Component
export default class CellEdittingModeErrorScreen extends React.Component {
    constructor(props) {
        super(props); 

        this.reset = this.reset.bind(this);
    }

    async reset(e) {
        e.preventDefault();
        await runCheckoutCommit(this.props.safetyCommit);
    }

    render () {

        console.log(this.props.safetyCommit);
        if (this.props.safetyCommit) {
            return (
                <Taskpane header={headerSize.Small} title="Error - It looks like you were still editting the spreadsheet">
                    <div className="card-div">
                        <p> We can't understand the changes that you made if you're still making them! To continue working: </p>
                        <p> 1. Make sure you're not in cell edditng mode. <b> Single clicking on any cell should do the trick!</b> Hint: if the green checkmark next to the formula bar is colored, then you're still editting.</p>
                        <p> 2. Click on the reset button below. </p>
                        <p> 3. Try your operation again. </p>
                        <div className="reset-button-div"> 
                            <PrimaryButton className="reset-button" type="button" onClick={(e) => this.reset(e)}>Reset</PrimaryButton> 
                        </div>
                    </div>
                </Taskpane>
            ); 
        } else {
            return (
                <Taskpane header={headerSize.Small} title="Error - It looks like you were still editting the spreadsheet">
                    <div className="card-div">
                        <p> Remember, we can't understand the changes that you made if you're still making them. To continue working: </p>
                        <p> 1. Make sure you're not in cell edditng mode. <b> Single clicking on any cell should do the trick!</b> Hint: if the green checkmark next to the formula bar is colored, then you are still in cell editting mode.</p>
                        <p> 2. Try your operation again. </p>
                    </div>
                </Taskpane>
            ); 
        }
    }
}