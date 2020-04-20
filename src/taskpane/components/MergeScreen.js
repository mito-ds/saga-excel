import * as React from "react";
import MergeProgressScreen from "./MergeProgressScreen";


/* global  */

export default class MergeScreen extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
        processingStep: 0,
        firstRender: true
    };

    this.updateValue = ''
    this.intermediateMessages = ["wow! This seems like a cool project", "merge early, merge often - Anonymous"]
    this.getMessage = this.getMessage.bind(this) 
    this.updateMergeStep = this.updateMergeStep.bind(this)
    this.updateStateAfterTime = this.updateStateAfterTime.bind(this)
  }

  // Create a reset state function


  getMessage = () => {
    const message = this.intermediateMessages[Math.floor(Math.random() * this.intermediateMessages.length)]
    return message
  }
  
  updateMergeStep = () => {
    console.log("update merge step")
  }

  updateStateAfterTime = () => {
    this.setState({firstRender: false});
    console.log(this.state.processingStep)
    setTimeout(() => {
      this.setState({processingStep: 1});
      console.log(this.state.processingStep)
    }, 2000);
  }

  render() {
    //const {message} = this.props;
    if (this.state.firstRender) {
      this.updateStateAfterTime()
    }

    console.log("In merge screen")

    if (this.state.processingStep == 0) {  
      console.log("In first merge screen")
      
      return (
        <MergeProgressScreen message="Finding your changes"></MergeProgressScreen>
      );
    }
    
    if (this.state.processingStep == 1) {
      return (
        <MergeProgressScreen message="Screen 2"></MergeProgressScreen>
      );
    } 

    if (this.state.processingStep == 2) {
      const progressMessage = this.getMessage()
      return (
        <MergeProgressScreen message="Screen 3"></MergeProgressScreen>
      );
    } 

    if (this.state.processingStep == 3) {
      return (
        <MergeProgressScreen message="Screen 2"></MergeProgressScreen>
      );
    } 
  }
}
