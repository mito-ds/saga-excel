import * as React from "react";
import { Spinner, SpinnerType } from "office-ui-fabric-react";
/* global Spinner */

export default class Progress extends React.Component {
  render() {
    const { logo, message, title } = this.props;

    return (
      <section className="ms-welcome__progress ms-u-fadeIn500">

        <div className="header">
          <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
          <p className="title-text" id="title-text">Saga</p>
        </div>
        <Spinner className type={SpinnerType.large} label={message} />
      </section>
    );
  }
}
