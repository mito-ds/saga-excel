import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { runCheckin } from "../../../saga/checkin";


// This means merge into master
export default class CheckinButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={runCheckin}
          >
            Check in
        </Button>
    );
  }
}
