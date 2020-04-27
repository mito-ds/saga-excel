import * as React from "react";


/* global  */

export default class MergeSuccess extends React.Component {

  constructor(props) {
    super(props); 
  }

  render() {
    console.log("Merge Success")
    return (
      <section className="ms-welcome__progress ms-u-fadeIn500">

        <div className="header">
          <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
          <p className="title-text" id="title-text">Your merge was successful</p>
        </div>
      </section>
    )
  }
}
