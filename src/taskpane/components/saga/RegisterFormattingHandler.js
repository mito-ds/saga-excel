import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";

/* global Excel, OfficeExtension */


function handleChange(event) {
   console.log(event);
}
  
  
async function registerFormatHandler() {
    console.log("REGISTERING")
    try {
        await Excel.run(async context => {
            var worksheet = context.workbook.worksheets.getActiveWorksheet();
            worksheet.onFormatChanged.add(handleChange);
        
            return context.sync();
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }

}

export default class RegisterFormattingHandler extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={registerFormatHandler}
          >
            Register Handlers
        </Button>
    );
  }
}
