import * as React from "react";
import MergeProgressScreen from "./MergeProgress";


/* global  */

export default class MergeProgressHandler extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
        processingStep: 0,
        firstRender: true
    };

    this.updateValue = ''
    this.intermediateMessagesOne = ["wow! This seems like a cool project", "Oh boy! I can't wait to see the results!"]
    this.intermediateMessagesTwo = ["Saga Tip: merge early, merge often", "Saga Tip: split work with your teamates so that you aren't edditting the same cells"]  
    this.getMessage = this.getMessage.bind(this) 
    this.updateMergeStep = this.updateMergeStep.bind(this)
    this.updateStateAfterTime = this.updateStateAfterTime.bind(this)
  }

  // Create a reset state function


  getMessage = (step) => {
    const messageArray = step === 1 ? this.intermediateMessagesOne : this.intermediateMessagesTwo;
    const message = messageArray[Math.floor(Math.random() * messageArray.length)]
    return message
  }

  updateMergeStep = () => {
    console.log("update merge step")
  }

  updateStateAfterTime = () => {
    this.setState({firstRender: false});
    setTimeout(() => {
      this.setState({processingStep: 1});
      console.log(this.state.processingStep)
    }, 4000);

    setTimeout(() => {
      this.setState({processingStep: 2});
      console.log(this.state.processingStep)
    }, 8000);

    setTimeout(() => {
      this.setState({processingStep: 3});
      console.log(this.state.processingStep)
    }, 12000);
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
      var progressMessage = this.getMessage(1)
      return (
        <MergeProgressScreen message={progressMessage}></MergeProgressScreen>
      );
    } 

    if (this.state.processingStep == 2) {
      const progressMessage = this.getMessage(2)
      return (
        <MergeProgressScreen message={progressMessage}></MergeProgressScreen>
      );
    } 

    if (this.state.processingStep == 3) {
      return (
        <MergeProgressScreen message="Almost done"></MergeProgressScreen>
      );
    } 
  }
}
