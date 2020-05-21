import * as React from "react";
import Diff from "./Diff"
import "./DiffSheet.css"

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
      
    let diffArray = [];

    this.props.sheetDiff.changes.forEach((change, idx) => {
        const key = change.sheet + idx;
        diffArray.push(
            (
            <Diff key={key} diff={change}/>)
        )
    })

    // TODO: let us make this a constant
    if (this.props.sheetDiff.changeType === "none") {
        return null;
    }

    const changeColor = {
        "modified": "normal",
        "inserted": "green",
        "deleted": "red",
    }

    const cardClass = "card " + changeColor[this.props.sheetDiff.changeType];

    return (
        <div className={cardClass}>
            <div className="card-title" onClick={this.togglePanel}>{this.props.sheetDiff.sheet}</div>
            {this.state.isExpanded ? diffArray : null}
        </div>
    );
  }
}
