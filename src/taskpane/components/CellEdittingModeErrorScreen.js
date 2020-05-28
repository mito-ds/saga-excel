import * as React from "react";
import Taskpane from "./Taskpane";
import { headerSize } from "../../constants";

// Login Form Component
export default class CellEdittingModeErrorScreen extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
        return (
            <Taskpane header={headerSize.Small} title="Error - It looks like you were still editting the spreadsheet">
                <div className="card-div">
                    <p>
                        Pleaes make sure you're not in cell edditng mode. <b>Single clicking on any cell should do the trick!</b> 
                    </p>
                    <p>
                        Hint: if the green checkmark next to the formula bar is colored, then you are still in cell editting mode. 
                    </p>
                </div>
            </Taskpane>
        );  
    }
}