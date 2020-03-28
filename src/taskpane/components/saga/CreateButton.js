import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { createSheet } from "./sagaUtils";

/* global Button, console, Excel */


async function firstCommit() {
    // Copies over the original sheets; has no parent!
    
}


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

    const headerRange = worksheet.getRange("A1:C1");
    headerRange.values = [["commit", "parent", "num"]];

    await context.sync();
}

/*
Sets up the headers for the commit worksheet, if they don't already exist
*/
async function setupMetadataHeaders(context) {
    // get the commit worksheet
    const worksheet = context.workbook.worksheets.getItemOrNullObject("saga");

    if (worksheet === null) {
        console.log("Worksheet saga does not exist. Did you create the saga project?");
        return;
    }

    const headerRange = worksheet.getRange("A1:C2");
    headerRange.values = [
        ["HEAD", "branch", "commit"],
        ["master", "master", ""]
    ];

    await context.sync();
}



async function createSaga() {
    try {
        await Excel.run(async context => {
            // Create the metadata sheetS
            await createSheet(context, "saga", Excel.SheetVisibility.visible);
            await createSheet(context, "saga-commits", Excel.SheetVisibility.visible);
            await setupCommitHeaders(context);
            await setupMetadataHeaders(context);
            

            return context.sync();
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }

}

export default class CreateButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={createSaga}
          >
            Create Saga
        </Button>
    );
  }
}
