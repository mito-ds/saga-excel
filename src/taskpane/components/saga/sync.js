import Project from "./Project"
import axios from "axios"
import { getFileContents } from "../../../fileUtils";
import { deleteNonsagaSheets } from "./checkout";

const BRANCH_STATE_HEAD = 0;
const BRANCH_STATE_AHEAD = 1;
const BRANCH_STATE_BEHIND = 2;
const BRANCH_STATE_FORKED = 3;


async function handleAhead(project, remoteURL, headCommitID, parentCommitID) {
  const fileContents = await getFileContents();
  const sheets = await project.getSheetsWithNames();
  const commitSheets = sheets.filter(sheet => {
    return sheet.name.startsWith(`saga-${headCommitID}`);
  }).map(sheet => sheet.name);

  console.log(`Master Sheets: ${commitSheets}`);
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

  const branchState = response.data.branchState;
  if (branchState !== BRANCH_STATE_BEHIND) {
    console.error("Error getting update from server, not behind.");
    return;
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
  return;
}

export async function updateShared(context) {
    const project = new Project(context);

    // Making sure master is already checked out
    // TODO: we can relax this eventually!
    const headBranch = await project.getHeadBranch();
    if (headBranch !== `master`) {
      console.error("Can only do updates when master is checked out.")
      return false;
    }

    const headCommitID = await project.getCommitIDFromBranch(headBranch);
    const parentCommitID = await project.getParentCommitID(headCommitID);

    const remoteURL = await project.getRemoteURL();

    console.log(headCommitID, parentCommitID);


    const response = await axios.get(`${remoteURL}/checkhead`, {
      params: {
        headCommitID: headCommitID,
        parentCommitID: parentCommitID
      }
    });
    const branchState = response.data.branch_state;
    console.log(`branch state ${branchState}`)

    if (branchState === BRANCH_STATE_HEAD) {
      console.log(`Already up to date with server`);
      return true;
    } else if (branchState === BRANCH_STATE_AHEAD) {
      const handledAhead = await handleAhead(project, remoteURL, headCommitID, parentCommitID);
      if (handledAhead) {
        console.log(`Updated master on server`);
        return true;
      } else {
        console.error(`Error: cannot update because`, updateResponse);
        return false;
      }      
    } else if (branchState === BRANCH_STATE_BEHIND) {
      await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
    } else {
      console.error("Cannot update shared as is forked from shared :(");
    }
}