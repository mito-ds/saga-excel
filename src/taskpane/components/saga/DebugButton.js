import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";

/* global Button, console, Excel */

/*
Gets a worksheet with the given name and:
hides it if is visible, or makes it visible if it is hidden
*/
async function toggleVisibility(context, worksheetName) {
    // get the worksheet
    const worksheet = context.workbook.worksheets.getItemOrNullObject(worksheetName);

    if (worksheet === null) {
        console.log(`Worksheet ${worksheetName} does not exist, nothing to toggle.`);
        return;
    }

    worksheet.load("name");
    worksheet.load("visibility");

    await context.sync();

    if (worksheet.visibility === "VeryHidden") {
        worksheet.visibility = "Visible";
        console.log(`Setting ${worksheet.name} to visible`);
    } else {
        worksheet.visibility = "VeryHidden";
        console.log(`Setting ${worksheet.name} to very hidden`);
    }
    await context.sync();
}

async function printDebugInfo() {
    try {
        await Excel.run(async context => {
            // Toggle visiblity on metadata sheets
            await toggleVisibility(context, "saga");
            await toggleVisibility(context, "saga-commits");

            return context.sync();
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }

}

export default class DebugButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={printDebugInfo}
          >
            Debug
        </Button>
    );
  }
}
