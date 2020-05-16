import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";
import MergeConflict from "./MergeConflict";


import './MergeConflictScreen.css';

/* global  */

export default class MergeErrorScreen extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
        conflicts: this.props.conflicts,
        resolutions: []
    }

    this.resolveConflicts = this.resolveConflicts.bind(this)

  }

  resolveConflicts(e) {
    e.preventDefault();
    let resolutions = []
    this.state.conflicts.forEach(function(conflict) {
        const selection = document.querySelector('input[name="' + conflict.cell + '"]:checked').value;
        const resolution = {
            cell: conflict.cell, 
            value: selection
        }
        resolutions.push(resolution)
    })

    this.setState({resolutions: resolutions});
    console.log(resolutions)
  }
    


  render() {

    let mergeConflictComponentsArray = []
    this.state.conflicts.forEach(function(conflict) {
        mergeConflictComponentsArray.push(<MergeConflict conflict={conflict}></MergeConflict>)
    });

    return (
      <Taskpane header={headerSize.SMALL} title="You need to resolve merge conflicts before your merge can finish">
        <div className="title-subtext-div">
            <div className="title-subtext">Pick which version of the cell you want to keep. They are ordered: <b>yours, collaborator’s, original</b>.</div>
        </div>
        <div className="conflict-card-div">
            <form onSubmit={this.resolveConflicts}>
                <div className="scrollable-div">
                    {mergeConflictComponentsArray}
                </div>
                <button className="resolve-conflicts-button" type="submit">Submit</button>
            </form>
        </div>
      </Taskpane>
    )
  }
}
