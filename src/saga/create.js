import { createSheet, getRandomID } from "./sagaUtils";
import { commit } from "./commit";
import { createBranch } from "./branch";
import { turnSyncOnAndUnpause, updateShared } from "./sync";
import Project from "./Project";
import axios from "axios";
import { runOperation, runOperationNoSync } from "./runOperation";
import { item } from "../constants";



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
    worksheet.names.add(item.HEAD, headRange);
    headRange.values = [[email]];

    // Setup, name range for branch name => commit mapping
    const branchRange = worksheet.getRange("B1:C2");
    worksheet.names.add(item.BRANCHES, branchRange);
    branchRange.values = [["master", "firstcommit"], [email, firstCommitID]];

    // Setup, name range for commit id => (parent commit id, name, message) mapping
    const commitRange = worksheet.getRange("D1:G1");
    worksheet.names.add(item.COMMITS, commitRange);
    commitRange.values = [["firstcommit", "", "", ""]];

    //Setup, name range for personal branch identifier
    const personalBranchName = worksheet.getRange("A3");
    worksheet.names.add(item.PERSONAL_BRANCH, personalBranchName);
    personalBranchName.values=[[email]];

    // Setup, name range for remote url
    const remoteRange = worksheet.getRange("A2");
    worksheet.names.add(item.REMOTE_URL, remoteRange);
    remoteRange.values = [[remoteURL]];

    // Setup, name range for last catch up commit
    const lastCatchUpRange = worksheet.getRange("A4");
    worksheet.names.add(item.LAST_CATCH_UP, lastCatchUpRange);
    lastCatchUpRange.values = [[firstCommitID]];

    //Setup, name range for the version id
    const versionRange = worksheet.getRange("A5");
    worksheet.names.add(item.VERSION, versionRange);
    versionRange.values = [["0.0.1"]];

    return context.sync();
}

export async function createRemoteURL() {
  var response;
  try {
    // Try and create a project
    response = await axios.post(
        "https://dqea2tpzrh.execute-api.us-east-1.amazonaws.com/Prod/create",
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
  turnSyncOnAndUnpause();

  return context.sync();
}

export async function setPersonalBranchName(personalBranchName) {
  try {
    await Excel.run(async context => {
        // Set personal branch name
        const project = await new Project(context);
        await project.updatePersonalBranchName(personalBranchName);
        return context.sync();
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
    }
  }
}


/*
  Replaces the current workbook with the given base 64 string
*/
export async function replaceFromBase64(context, fileContents) {

  const project = new Project(context);
  const sheets = await project.getSheetsWithNames();

  for (let i = 1; i < sheets.length; i++) {
    sheets[i].delete();
  }

  sheets[0].name = "saga-tmp";

  await context.sync();

  const worksheets = context.workbook.worksheets;
  worksheets.addFromBase64(
    fileContents
  );
  await context.sync();

  sheets[0].delete();
  
  return context.sync();
}

export async function runReplaceFromBase64(fileContents) {
  await runOperationNoSync(replaceFromBase64, fileContents);
}

async function createFromURL(context, url, email) {
  // TODO: make a branch w/ email, and check it out.

  /*
    Note: the URLs we use on the outside are just a display, we
    don't actually send or receive data from this URL. This is just
    a workaround until we can move sagacollab.com to AWS.
  */
 const urlArray = url.trim().split("/");
 const id = urlArray[urlArray.length - 1];

  const response = await axios.get(
    "https://dqea2tpzrh.execute-api.us-east-1.amazonaws.com/Prod/getProject", 
    {
      params: {
        id: id,
        headCommitID: ``,
        parentCommitID: ``,
        cacheBuster: new Date().getTime()
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

  // Load in the project
  await replaceFromBase64(context, fileContents);

  // Switch the existing personal version for your own
  const worksheets = context.workbook.worksheets;
  const sagaworksheet = worksheets.getItem("saga");
  await createBranch(context, email);
  const personalBranchRange = sagaworksheet.getRange("A3");
  personalBranchRange.values = [[email]];
  const headRange = sagaworksheet.getRange("A1");
  headRange.values = [[email]];
  await context.sync();

  turnSyncOnAndUnpause();

  await context.sync();
}


export async function runCreateFromURL(remoteURL, email) {
  return await runOperation(createFromURL, remoteURL, email);
}

export async function runCreateSaga(remoteURL, email) {
  return await runOperation(createSaga, remoteURL, email);
}