import * as React from "react";
import { PrimaryButton } from '@fluentui/react';
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";


import './MergeConflictScreen.css';

/* global  */

export default class MergeErrorScreen extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
        conflicts: this.props.conflicts
    }
  }


  render() {
    console.log("STATE CONFLICTS")
    console.log(this.state.conflicts)
    return (
      <Taskpane header={headerSize.SMALL} title="You need to resolve merge conflicts before your merge can finish">
        <div className="title-subtext">Pick which version of the cell you want to keep. From top to bottom, the changes are ordered: yours, collaborator’s, original.</div>
      </Taskpane>
    )
  }
}
