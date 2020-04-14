import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";

/* global Office */

async function toggle() {
  await Office.addin.hide();
}

export default class VisibleButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={toggle}
          >
            Toggle Visibility
        </Button>
    );
  }
}
