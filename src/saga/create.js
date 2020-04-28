import { createSheet, getRandomID } from "./sagaUtils";
import { commit } from "./commit";
import { createBranch } from "./branch";
import { turnSyncOn, updateShared } from "./sync";
import Project from "./Project"
import axios from "axios"
import { runOperation } from "./runOperation";


/* global Excel, OfficeExtension */

/*
Sets up the headers for the commit worksheet, if they don't already exist
*/
async function setupSagaSheet(context, remoteURL, email, firstCommitID) {
    // First, we create the sheet
    // TODO: change to very hidden
    const worksheet = await createSheet(context, "saga", Excel.SheetVisibility.hidden);

    // Setup, name range for head branch
    const headRange = worksheet.getRange("A1");
    worksheet.names.add(`HEAD`, headRange)
    headRange.values = [[email]];

    // Setup, name range for branch name => commit mapping
    const branchRange = worksheet.getRange("B1:C2");
    worksheet.names.add("branches", branchRange)
    branchRange.values = [["master", "firstcommit"], [email, firstCommitID]];

    // Setup, name range for commit id => (parent commit id, name, message) mapping
    const commitRange = worksheet.getRange("D1:G1");
    worksheet.names.add("commits", commitRange)
    commitRange.values = [["firstcommit", "", "", ""]];

    //Setup, name range for personal branch identifier
    const personalBranchName = worksheet.getRange("A3");
    worksheet.names.add('personalBranchName', personalBranchName);
    personalBranchName.values=[[email]];

    // Setup, name range for remote url
    const remoteRange = worksheet.getRange("A2");
    worksheet.names.add("remote", remoteRange)
    remoteRange.values = [[remoteURL]]

    return context.sync();
}

export async function createRemoteURL() {
  var response;
  try {
    // Try and create a project
    response = await axios.post(
        "https://excel.sagacollab.com/project/create",
    );
  } catch (e) {
    // If we are offline or can't connect, return null
    return null;
  }

  if (response.status !== 200) {
    return null;
  }

  return `https://excel.sagacollab.com/project/${response.data.id}`;

}


async function createSaga(context, remoteURL, email) {
  const firstCommitID = getRandomID();

  // Create the metadata sheet
  await setupSagaSheet(context, remoteURL, email, firstCommitID);

  // Create the first commit 
  await commit(context, "Create Saga Project", "Saga project creation", "master", firstCommitID);

  // Update the shared repository
  // TODO: error check this!
  await updateShared(context);

  // Start syncing this with master
  turnSyncOn();

  return context.sync();
}

export async function setPersonalBranchName(personalBranchName) {
  try {
    await Excel.run(async context => {
        // Set personal branch name
        const project = await new Project(context);
        await project.updatePersonalBranchName(personalBranchName)
        return context.sync()
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
    }
  }
}

async function createFromURL(context, url, email) {
  // TODO: make a branch w/ email, and check it out.

  url = url.trim();

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
  

  const sagaworksheet = worksheets.getItem("saga");
  // Switch the existing personal version for your own
  await createBranch(context, email);
  const personalBranchRange = sagaworksheet.getRange("A3");
  personalBranchRange.values = [[email]];
  const headRange = sagaworksheet.getRange("A1");
  headRange.values = [[email]];
  await context.sync();

  turnSyncOn();

  await context.sync();
}


export async function runCreateFromURL(remoteURL, email) {
  await runOperation(createFromURL, remoteURL, email);
}

export async function runCreateSaga(remoteURL, email) {
  await runOperation(createSaga, remoteURL, email);
}