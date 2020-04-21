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
    this.intermediateMessages = [ "Saga Tip: Merge early, merge often", 
                                  "Saga Tip: Split work with your teamates so that you aren't edditting the same cells",
                                  "The key to collaboration is preparation",
                                  "Wow! This seems like a cool project",
                                  "Oh boy! I can't wait to see the results!",
                                  "We are hard at work processing your merge",
                                  "Woah! I didn't know Excel had this many cells",
                                  "Sit back, relax, and enjoy the merge"
                                ]
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
      var progressMessage = this.getMessage()
      return (
        <MergeProgressScreen message={progressMessage}></MergeProgressScreen>
      );
    } 

    if (this.state.processingStep == 2) {
      const progressMessage = this.getMessage()
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
