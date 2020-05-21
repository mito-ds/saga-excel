import * as React from "react";
import Diff from "./Diff"


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
            (<Diff key={key} diff={change}/>)
        )
    })

    return (
        <div onClick={this.togglePanel}>
            <div>{this.props.sheetDiff.sheet}</div>
            {this.state.isExpanded ? diffArray : null}
        </div>
    );
  }
}
