import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import {commit} from "./commit";

/* global Button, console, Excel */

async function makeNewCommit() {
    try {
        await Excel.run(async context => {
            await commit(context);
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }
}

export default class CommitButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={makeNewCommit}
          >
            Commit
        </Button>
    );
  }
}
