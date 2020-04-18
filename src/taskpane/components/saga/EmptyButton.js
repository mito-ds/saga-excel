import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";

/* global Office */


export default class EmptyButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={this.props.function}
          >
            {this.props.label}
        </Button>
    );
  }
}
