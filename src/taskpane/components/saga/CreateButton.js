import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { createSheet } from "./sagaUtils";
import { getFileContents } from "../../../fileUtils";
import $ from "jquery";


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

    const headerRange = worksheet.getRange("A1:E1");
    headerRange.values = [["commit", "parent", "num", "name", "message"]];

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

    const headerRange = worksheet.getRange("A1:D2");
    headerRange.values = [
        ["HEAD", "remote", "branch", "commit"],
        ["master", "", "master", ""]
    ];

    await context.sync();
}


async function postData(url, data) {
    // Default options are marked with *
    console.log("POSTING DATA:", data);
  
    const response = await $.ajax({
      type: "POST",
      url: url,
      contentType: "application/json",
      data: JSON.stringify(data)
    }).promise();
    return response;
}

async function createRemote(context) {
    const fileContents = await getFileContents();
    // TODO: handle errors here, we don't know what the network is going to do
    const response = await postData(
        "https://excel.sagalab.org/create", 
        {
            "fileContents": fileContents
        }
    )
    const remoteUrl = `https://excel.sagalab.org/project/${response["id"]}`;
    // Saves the remote url
    const range = context.workbook.worksheets.getItemOrNullObject("saga").getRange("B2");
    range.values = remoteUrl;

    return context.sync();
}



async function createSaga() {
    try {
        await Excel.run(async context => {
            // Create the metadata sheetS
            // TODO: name all the things! https://docs.microsoft.com/en-us/javascript/api/excel/excel.nameditemcollection?view=excel-js-preview

            await createSheet(context, "saga", Excel.SheetVisibility.visible);
            await createSheet(context, "saga-commits", Excel.SheetVisibility.visible);
            await setupCommitHeaders(context);
            await setupMetadataHeaders(context);
            // We also are going to try and create a remote project
            await createRemote(context);

            

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
