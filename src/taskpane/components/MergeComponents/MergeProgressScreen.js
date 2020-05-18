import * as React from "react";
import { Spinner, SpinnerType } from "office-ui-fabric-react";
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";


export default class MergeProgressScreen extends React.Component {
    constructor(props) {
      super(props);
      this.props = props

    }
    render() {
        return (
            <Taskpane header={headerSize.LARGE} title={this.props.message}>
                <Spinner className type={SpinnerType.large} label="Merging... please do not edit the file." />
            </Taskpane>
        );
    }
  }