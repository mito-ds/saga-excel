import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";

/* global Button, console, Excel */

/*
Sets up the headers for the commit worksheet, if they don't already exist
*/
async function setupCommitHeaders(context) {
    // get the commit worksheet
    const worksheet = context.workbook.worksheets.getItemOrNullObject("saga-commits");

    if (worksheet === null) {
        console.log("Worksheet saga-commits does not exist. Did you create the saga project?");
        return;
    }

    const headerRange = worksheet.getRange("A1:B1");
    headerRange.values = [["commit", "parent"]];

    await context.sync();
}

async function makeNewCommit() {
    try {
        await Excel.run(async context => {
            // Toggle visiblity on metadata sheets
            await setupCommitHeaders(context);

            return context.sync();
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
