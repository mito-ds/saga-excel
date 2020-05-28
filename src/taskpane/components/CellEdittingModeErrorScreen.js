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
            <Taskpane header={headerSize.Small} title="Sorry, we can't perform that operation while you're editing the spreadsheet.">
                <div className="card-div">
                    <p>
                        Make sure you're not editing a cell. <b>Single clicking on any cell should do the trick!</b> 
                    </p>
                    <p>
                        Hint: If the green checkmark next to the formula bar is colored, then you're still editting. 
                    </p>
                </div>
            </Taskpane>
        );  
    }
}