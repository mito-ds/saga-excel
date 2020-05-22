import * as React from "react";
import Diff from "./Diff"
import "./DiffSheet.css"
import { changeType } from "../../../constants";

/* global  */

export default class DiffSheet extends React.Component {

    constructor(props) {
        super(props); 
        this.state = { isExpanded: false };
        
        this.togglePanel = this.togglePanel.bind(this);
    }
    
    togglePanel() {
        this.setState({isExpanded: !this.state.isExpanded})
    }
    
    render() {  
        // If there are no changes, we render nothing 
        if (this.props.sheetDiff.changeType === changeType.NONE) {
            return null;
        }
      
        let diffArray = [];
        this.props.sheetDiff.changes.forEach((change, idx) => {
            diffArray.push((<Diff key={change.sheetName + idx} diff={change}/>))
        })

        // Color the sheet card differently, depending on how it was edited
        const changeColor = {
            "Modified": "normal",
            "Inserted": "green",
            "Deleted": "red",
        }
        const cardClass = "card " + changeColor[this.props.sheetDiff.changeType];

        // We then display the operation performed on top of the sheet name
        const sheetName = `${this.props.sheetDiff.sheetName} : ${this.props.sheetDiff.changeType}`

        return (
            <div className={cardClass}>
                <div className="card-title" onClick={this.togglePanel}>
                    <div>
                        {sheetName}
                    </div>
                    {
                        this.props.sheetDiff.changeType === changeType.MODIFIED 
                        ? 
                        <div>
                            <input className={"clipboard " + (this.state.isExpanded ? "flip" : "")} type="image" src="assets/dropdown.png" width="30vw" border="0" alt="Dropdown"/>
                        </div> 
                        : 
                        null
                    }
                </div>
                {this.state.isExpanded ? diffArray : null}
            </div>
        );
    }
}
