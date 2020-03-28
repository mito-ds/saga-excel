import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";

/* global Button, console, Excel */

/*
Creates a new sheet with the given name and visibility. 
Errors if a sheet with that name already exists.
*/
async function createSheet(context, worksheetName, worksheetVisibility) {
    // copy a sheet
    const activeSheet = context.workbook.worksheets.getActiveWorksheet();
    const copiedSheet = activeSheet.copy(Excel.WorksheetPositionType.end);
    // clear the sheet
    copiedSheet.getUsedRange().clear("all");
    // Set the name and visibiliy
    await context.sync();
    copiedSheet.name = worksheetName;
    copiedSheet.visibility = worksheetVisibility;

    console.log(`Created sheet ${worksheetName} and set to ${worksheetVisibility}`);

    return context.sync();
}


async function createSaga() {
    try {
        await Excel.run(async context => {
            // Create the metadata sheetS
            await createSheet(context, "saga", Excel.SheetVisibility.visible);
            await createSheet(context, "saga-commits", Excel.SheetVisibility.visible);

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
