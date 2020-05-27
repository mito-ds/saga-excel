import * as React from "react";
import Taskpane from "./Taskpane";
import { headerSize } from "../../constants";


// Login Form Component
export default class HelpScreen extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
        return (
            <Taskpane header={headerSize.SMALL} title="How to use Saga! We promise its not that hard :)">
                <div className="card-div">
                    <p> We can't understand the changes that you made if you're still making them! To continue working: </p>
                    <p> 1. Make sure you're not in cell edditng mode. <b> Single clicking on any cell should do the trick!</b> Hint: if the green checkmark next to the formula bar is colored, then you're still editting.</p>
                    <p> 2. Click on the reset button below. </p>
                    <p> 3. Try your operation again. </p>
                </div>
            </Taskpane>
        );    
    }
}