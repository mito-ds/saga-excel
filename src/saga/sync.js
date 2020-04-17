import Project from "./Project";
import axios from "axios";
import { getFileContents } from "./fileUtils";
import { runOperation } from "./runOperation";

/* global Excel, OfficeExtension */

const BRANCH_STATE_HEAD = 0;
const BRANCH_STATE_AHEAD = 1;
const BRANCH_STATE_BEHIND = 2;
//const BRANCH_STATE_FORKED = 3;

export async function saveUserEmail(newEmail) {
  console.log(newEmail)

  const response = await axios.post(
    "https://excel.sagalab.org/project/postemail",
    {"newEmail": newEmail}
  );
  console.log(response)
}


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


  const branchState = response.data.branchState;
  if (branchState !== BRANCH_STATE_BEHIND) {
    console.error("Error getting update from server, not behind.");
    return false;
  }

  const fileContents = response.data.fileContents;
  const commitIDs = response.data.commitIDs;
  const commitSheets = response.data.commitSheets;

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

    const response = await axios.get(`${remoteURL}/checkhead`, {
      params: {
        headCommitID: headCommitID,
        parentCommitID: parentCommitID
      }
    });

    if (response.status === 404) {
      console.log("Project does not exist.");
      return false;
    }

    const branchState = response.data.branch_state;

    if (branchState === BRANCH_STATE_HEAD) {
      console.log(`Already up to date with server`);
      return true;
    } else if (branchState === BRANCH_STATE_AHEAD) {
      const handledAhead = await handleAhead(project, remoteURL, headCommitID, parentCommitID);
      if (handledAhead) {
        console.log(`Local was ahead... updated master on server.`);
        return true;
      } else {
        console.error(`Error: cannot update because`, response);
        return false;
      }      
    } else if (branchState === BRANCH_STATE_BEHIND) {
      const updated = await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
      return updated;
    } else {
      console.error("Cannot update shared as is forked from shared :(");
      return false;
    }
}

// TODO: move the sync function here

async function sync() {
  console.log("syncing...")
  await runOperation(updateShared);
}

async function runSaveUserEmail(newEmail) {
  console.log(`saving user email: ${newEmail}`)
  await runOperation(saveUserEmail, newEmail)
}

var syncInt;

export function turnSyncOn() {
  // If sync is not on, turn it on.
  if (!syncInt) {
    syncInt = setInterval(sync, 3000);
  }
}

export function turnSyncOff() {
  // If syncing is on, turn it off.
  if (syncInt) {
    clearInterval(syncInt);
    syncInt = null;
  }
}