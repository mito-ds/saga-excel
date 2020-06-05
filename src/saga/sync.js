import Project from "./Project";
import axios from "axios";
import { getFileContents } from "./fileUtils";
import { branchState, TEST_URL } from "../constants";

/* global Excel, OfficeExtension */

async function handleAhead(project, remoteURL, headCommitID, parentCommitID) {
  const fileContents = await getFileContents();
  const sheets = await project.getSheetsWithNames();
  const commitSheets = sheets.filter(sheet => {
    return sheet.name.startsWith(`saga-${headCommitID}`);
  }).map(sheet => sheet.name);

  const urlArray = remoteURL.trim().split("/");
  const id = urlArray[urlArray.length - 1];

  const updateResponse = await axios.post(
    "https://beyheywy4j.execute-api.us-east-1.amazonaws.com/Stage/postProject",
    {
      id: id,
      headCommitID: headCommitID,
      parentCommitID: parentCommitID,
      fileContents: fileContents,
      commitSheets: commitSheets
    }
  );
  // We need to now check if the update was successful
  if (updateResponse.status === 200) {
    return true;
  }

  return false;
}

export async function addUpdateToProject(context, headCommitID, fileContents, commitIDs, commitSheets) {

  const project = new Project(context);

  const worksheets = context.workbook.worksheets;
  worksheets.addFromBase64(
    fileContents,
    commitSheets,
    Excel.WorksheetPositionType.end
  );

  // Then, we add the commit IDs to the commit database
  var parentID = headCommitID;
  for (let i = 0; i < commitIDs.length; i++) {
    const commitID = commitIDs[i];
    await project.updateBranchCommitID("master", commitID);
    await project.addCommitID(commitID, parentID, "from remote", "from remote");
    parentID = commitID;
  }
}

export async function getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID) {

  const urlArray = remoteURL.trim().split("/");
  const id = urlArray[urlArray.length - 1];

  // Merge in the sheet
  const response = await axios.get(
    "https://beyheywy4j.execute-api.us-east-1.amazonaws.com/Stage/getProject", 
    {
      params: {
        id: id,
        headCommitID: headCommitID,
        parentCommitID: parentCommitID
      }
    }
  );
  // TODO: error check!
  if (response.status === 404) {
    // TODO: we need to handle the case where there is no remote!
    console.error("Error getting update from server, project doesn't exist");
    return null;
  } 


  const remoteBranchState = response.data.branchState;
  if (remoteBranchState !== branchState.BRANCH_STATE_BEHIND) {
    console.error(`Error getting update from server, branch state is ${remoteBranchState}.`);
    return null;
  }

  const fileContents = response.data.fileContents;
  const commitIDs = response.data.commitIDs;
  const commitSheets = response.data.commitSheets;

  // Actually add this to the project
  await addUpdateToProject(project.context, headCommitID, fileContents, commitIDs, commitSheets);

  console.log(`Local updated from server.`);
  return {
    fileContents: fileContents,
    commitIDs: commitIDs,
    commitSheets: commitSheets
  };
}



export async function updateShared(context) {
    const project = new Project(context);

    const headCommitID = await project.getCommitIDFromBranch(`master`);
    const parentCommitID = await project.getParentCommitID(headCommitID);
    const remoteURL = await project.getRemoteURL();

    /*
      If we are in a test, then we don't do any syncing.
      If you wish to test a mulitplayer scenario, see the testing documentation
      in src/tests/README.md.
    */
    if (remoteURL.startsWith(TEST_URL)) {
      return branchState.BRANCH_STATE_HEAD;
    }

    const urlArray = remoteURL.trim().split("/");
    const id = urlArray[urlArray.length - 1];

    console.log(`Remote URL: ${remoteURL} ID: ${id}`);


    const response = await axios.get(
      `https://beyheywy4j.execute-api.us-east-1.amazonaws.com/Stage/checkhead`, 
      {
        params: {
          id: id,
          headCommitID: headCommitID,
          parentCommitID: parentCommitID
        }
      }
    );

    if (response.status === 404) {
      return branchState.BRANCH_STATE_ERROR;
    }

    const currBranchState = response.data.branchState;

    if (currBranchState === branchState.BRANCH_STATE_HEAD) {
      console.log(`Already up to date with server`);
      return branchState.BRANCH_STATE_HEAD;
    } else if (currBranchState === branchState.BRANCH_STATE_AHEAD) {
      const handledAhead = await handleAhead(project, remoteURL, headCommitID, parentCommitID);
      if (handledAhead) {
        console.log(`Local was ahead... updated master on server.`);
        return branchState.BRANCH_STATE_HEAD;
      } else {
        console.error(`Error: cannot update because`, response);
        return branchState.BRANCH_STATE_AHEAD;
      }      
    } else if (currBranchState === branchState.BRANCH_STATE_BEHIND) {
      const update = await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
      return update !== null ? branchState.BRANCH_STATE_HEAD : branchState.BRANCH_STATE_BEHIND;
    } else {
      console.error("Cannot update shared as is forked from shared :(");
      return currBranchState;
    }
}

// TODO: move the sync function here

async function sync() {
  console.log("Syncing:");
  const turnedOff = turnSyncOff();
  if (turnedOff) {
    console.log("Turned sync off");
  }

  try {
    await Excel.run(async context => {
        // We do not use runOperation here, as sync shouldn't reload itself
        await updateShared(context);
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
    }
  }
  const turnedOn = turnSyncOn();
  if (turnedOn) {
    console.log("Turned sync back on");
  }
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}


var g = getGlobal();

/*
  If syncing is off, turn it on, and report that it was turned on successfully.
  Otherwise, return false (as it was not turned on, because it was already on).
*/
export function turnSyncOn() {
  if (!g.syncInt) {
    g.syncInt = setInterval(sync, 5000);
    return true;
  }
  return false;
}

/*
  If syncing is on, turn it off, and report that it was successfully turned off.
  Otherwise, return false (it was not turned off b/c it as not on).
*/
export function turnSyncOff() {
  if (g.syncInt) {
    clearInterval(g.syncInt);
    g.syncInt = null;
    return true;
  }
  return false;
}