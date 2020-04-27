import * as React from "react";
import { mergeState } from "../../../constants";
import MergeError from "./MergeError";
import MergeProgress from "./MergeProgress";
import MergeForked from "./MergeForked";
import MergeSuccess from "./MergeSuccess";

/* global  */

const INTERMEDIATE_MESSAGES = [ 
  "Saga Tip: Merge early, merge often", 
  "Saga Tip: Split work with your teamates so that you aren't edditting the same cells",
  "The key to collaboration is preparation",
  "Wow! This seems like a cool project",
  "Oh boy! I can't wait to see the results!",
  "We are hard at work processing your merge",
  "Woah! I didn't know Excel had this many cells",
  "Sit back, relax, and enjoy the merge"
]

function randomMessage() {
  return INTERMEDIATE_MESSAGES[Math.floor(Math.random() * INTERMEDIATE_MESSAGES.length)];
}

export default class MergeProgressHandler extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
        processingStep: 0,
        firstRender: true
    };
  }


  render() {

    switch(this.props.mergeState) {
      case mergeState.MERGE_IN_PROGRESS:
        // TODO: make this display a random message
        return (<MergeProgress/>);
      
      case mergeState.MERGE_SUCCESS:
        return (<MergeSuccess/>)

      case mergeState.MERGE_ERROR:
        return (<MergeError/>)

      case mergeState.MERGE_FORKED:
        return (<MergeForked/>)
    }
  }
}
