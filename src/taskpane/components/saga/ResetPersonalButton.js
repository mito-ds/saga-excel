import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { runResetPersonalVersion } from "../../../saga/resetPersonal";


/* global */


export default class ResetPersonalButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={runResetPersonalVersion}
          >
            Reset Personal Version
        </Button>
    );
  }
}
