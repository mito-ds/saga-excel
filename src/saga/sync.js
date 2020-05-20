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

  const updateResponse = await axios.post(
    remoteURL,
    {
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

async function getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID) {

  // Merge in the sheet
  const response = await axios.get(remoteURL, {
    params: {
      headCommitID: headCommitID,
      parentCommitID: parentCommitID
    }
  });
  // TODO: error check!
  if (response.status === 404) {
    // TODO: we need to handle the case where there is no remote!
    console.error("Error getting update from server, project doesn't exist");
    return false;
  } 


  const remoteBranchState = response.data.branchState;
  if (remoteBranchState !== branchState.BRANCH_STATE_BEHIND) {
    console.error(`Error getting update from server, branch state is ${remoteBranchState}.`);
    return false;
  }

  const fileContents = response.data.fileContents;
  const commitIDs = response.data.commitIDs;
  const commitSheets = response.data.commitSheets;

  // TODO: we should change the head commit here...


  // We only merge in the commit sheets
  const worksheets = project.context.workbook.worksheets;
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
  console.log(`Local updated from server.`);
  return true;
}

export async function updateShared(context) {
    const project = new Project(context);

    const headCommitID = await project.getCommitIDFromBranch(`master`);
    const parentCommitID = await project.getParentCommitID(headCommitID);
    const remoteURL = await project.getRemoteURL();

    if (remoteURL === TEST_URL) {
      console.log("using test url, done syncing");
      return branchState.BRANCH_STATE_HEAD;
    }

    const response = await axios.get(`${remoteURL}/checkhead`, {
      params: {
        headCommitID: headCommitID,
        parentCommitID: parentCommitID
      }
    });

    if (response.status === 404) {
      return branchState.BRANCH_STATE_ERROR;
    }

    const currBranchState = response.data.branch_state;

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
      const updated = await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
      return updated ? branchState.BRANCH_STATE_HEAD : branchState.BRANCH_STATE_BEHIND;
    } else {
      console.error("Cannot update shared as is forked from shared :(");
      return currBranchState;
    }
}

// TODO: move the sync function here

async function sync() {
  console.log("syncing...", g.syncInt)
  turnSyncOff();
  console.log("turned sync off", g.syncInt)
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
  turnSyncOn();
  console.log("turned sync back on", g.syncInt)
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

export function turnSyncOn() {
  // If sync is not on, turn it on.
  if (!g.syncInt) {
    g.syncInt = setInterval(sync, 5000);
  }
}

export function turnSyncOff() {
  // If syncing is on, turn it off.
  if (g.syncInt) {
    clearInterval(g.syncInt);
    g.syncInt = null;
  }
}