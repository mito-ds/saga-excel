import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { createSheet } from "./sagaUtils";
import { getFileContents } from "../../../fileUtils";
import $ from "jquery";
import { executeCommit } from "./commit";


/* global Button, console, Excel */

/*
Sets up the headers for the commit worksheet, if they don't already exist
*/
async function setupSagaSheet(context) {
    // First, we create the sheet
    const worksheet = await createSheet(context, "saga", Excel.SheetVisibility.visible);

    // Setup, name range for head branch
    const headRange = worksheet.getRange("A1");
    worksheet.names.add(`HEAD`, headRange)
    headRange.values = [["master"]];

    // Setup, name range for branch name => commit mapping
    const branchRange = worksheet.getRange("B1:C1");
    worksheet.names.add("branches", branchRange)
    branchRange.values = [["master", ""]];

    // Setup, name range for commit id => (parent commit id, name, message) mapping
    const commitRange = worksheet.getRange("D1:G1");
    worksheet.names.add("commits", commitRange)
    commitRange.values = [["", "", "", ""]];

    //Setup, name range for personal branch identifier
    const personalBranchName = worksheet.getRange("A3");
    worksheet.names.add('personalBranchName', personalBranchName);
    personalBranchName.values=[[""]];

    return context.sync();
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
    );
    const worksheet = context.workbook.worksheets.getItem("saga");

    const remoteURL = `https://excel.sagalab.org/project/${response["id"]}`;

    // Setup, name range for remote url
    const remoteRange = worksheet.getRange("A2");
    worksheet.names.add("remote", remoteRange)
    remoteRange.values = [[remoteURL]]

    return context.sync();
}



async function createSaga() {
    try {
        await Excel.run(async context => {
            // Create the metadata sheet
            await setupSagaSheet(context);
            
            // Try and create a remote project
            await createRemote(context);

            // Create the first commit 
            await executeCommit(context, "Create Saga Project", "Deafult First Commit on creation of saga project");

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
