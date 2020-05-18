import * as React from "react";
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";


/* global  */

export default class MergeSuccessScreen extends React.Component {

  constructor(props) {
    super(props); 
  }

  render() {
    return (
      <Taskpane header={headerSize.LARGE} title="Your merge was successful."/>
    )
  }
}
