import * as React from "react";
import { Spinner, SpinnerType } from "office-ui-fabric-react";
import Taskpane from "../Taskpane";

export default class MergeProgressScreen extends React.Component {
    constructor(props) {
      super(props);
      this.props = props

    }
    render() {
        return (
            <Taskpane title={this.props.message}>
                <Spinner className type={SpinnerType.large} label="Merging..." />
            </Taskpane>
        );
    }
  }