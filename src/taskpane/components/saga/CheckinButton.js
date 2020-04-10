import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { checkin } from "./checkin";

/* global console, Excel */

async function runCheckin() {
  try {
    await Excel.run(async context => {
        await checkin(context);
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
    }
  }
}

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
