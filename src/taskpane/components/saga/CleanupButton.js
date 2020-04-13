import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { getSheetsWithNames } from "../../../saga/sagaUtils";

/* global Excel, OfficeExtension */

async function cleanup() {
    try {
        await Excel.run(async context => {
            // Make sure we have the sheet named properly
            const worksheets = await getSheetsWithNames(context);
            const sagaWorksheets = worksheets.filter(sheet => sheet.name.startsWith("saga"))
        
            sagaWorksheets.forEach(worksheet => worksheet.delete());

            return context.sync();
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }

}

export default class CleanupButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={cleanup}
          >
            Cleanup
        </Button>
    );
  }
}
