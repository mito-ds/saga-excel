import { createSheet } from "./sagaUtils";
import { getFileContents } from "./fileUtils";
import { commit } from "./commit";
import { turnSyncOn } from "./sync";
import Project from "./Project"
import axios from "axios"
import { runOperation } from "./runOperation";


/* global Excel */

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
    branchRange.values = [["master", "firstcommit"]];

    // Setup, name range for commit id => (parent commit id, name, message) mapping
    const commitRange = worksheet.getRange("D1:G1");
    worksheet.names.add("commits", commitRange)
    commitRange.values = [["firstcommit", "", "", ""]];

    //Setup, name range for personal branch identifier
    const personalBranchName = worksheet.getRange("A3");
    worksheet.names.add('personalBranchName', personalBranchName);
    personalBranchName.values=[[""]];

    return context.sync();
}

async function createRemote(context) {
    const fileContents = await getFileContents();
    // TODO: handle errors here, we don't know what the network is going to do
    const response = await axios.post(
        "https://excel.sagalab.org/project/create",
        {"fileContents": fileContents}
    );
    
    const worksheet = context.workbook.worksheets.getItem("saga");

    const remoteURL = `https://excel.sagalab.org/project/${response.data.id}`;

    // Setup, name range for remote url
    const remoteRange = worksheet.getRange("A2");
    worksheet.names.add("remote", remoteRange)
    remoteRange.values = [[remoteURL]]

    return context.sync();
}

async function createSaga(context) {
  // Create the metadata sheet
  await setupSagaSheet(context);
            
  // Try and create a remote project
  await createRemote(context);

  // Create the first commit 
  await commit(context, "Create Saga Project", "Saga project creation");

  // Start syncing this with master
  turnSyncOn();

  return context.sync();
}



export async function runCreateSaga() {
  await runOperation(createSaga);
}


async function createFromURL(context, url) {
  const response = await axios.get(
    url, 
    {
      params: {
        headCommitID: ``,
        parentCommitID: ``
      }
    }
  );

  if (response.status === 404) {
    console.error(`No project exists as ${url}`);
    return;
  }

  const fileContents = response.data.fileContents;
  if (fileContents === `` || fileContents === undefined) {
    console.error(`Project at ${url} is empty, nothing to pull.`);
    return;
  }

  const project = new Project(context);
  const sheets = await project.getSheetsWithNames();

  for (let i = 1; i < sheets.length; i++) {
    sheets[i].delete();
  }

  sheets[0].name = "saga-tmp"

  await context.sync()

  const worksheets = context.workbook.worksheets;
  worksheets.addFromBase64(
    fileContents
  );
  await context.sync();

  sheets[0].delete();
  // TODO: we also have to clear the personal branch!

  turnSyncOn();

  await context.sync();
}



export async function runCreateFromURL(url) {
  await runOperation(createFromURL, url);
  }