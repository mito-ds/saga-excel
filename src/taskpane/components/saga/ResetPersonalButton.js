import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { resetPersonalVersion } from "./ResetPersonal";


/* global Excel, OfficeExtension */



async function reset() {
    try {
        await Excel.run(async context => {
            await resetPersonalVersion(context);
            return context.sync();
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }

}

export default class ResetPersonalButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={reset}
          >
            Reset Personal Version
        </Button>
    );
  }
}
