import * as React from "react";
import Taskpane from "../Taskpane";

/* global  */

export default class MergeSuccessScreen extends React.Component {

  constructor(props) {
    super(props); 
  }

  render() {
    return (
      <Taskpane title="Your merge was successful."/>
    )
  }
}
