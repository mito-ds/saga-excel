import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import Project from "./Project";
import axios from "axios";
import { getFileContents } from "./fileUtils";
import { branchState, TEST_URL } from "../constants";
import { getGlobal } from "../commands/commands"

/* global Excel, OfficeExtension */

var syncLogger;
var setupLog = false;


function setupLogger() {
    if (!setupLog) {
        prefix.reg(log);
        syncLogger = log.getLogger('sync');
        const global = getGlobal();
        prefix.apply(syncLogger, {
            template: `[%t] %l [sync] email=${global.email} remoteURL=${global.remoteURL}`
        });
        setupLog = true;
    }
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
  
  syncLogger.info("getUpdateFromServer");

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
    syncLogger.error("404");
    return false;
  } 


  const remoteBranchState = response.data.branchState;
  if (remoteBranchState !== branchState.BRANCH_STATE_BEHIND) {
    syncLogger.error(`remoteBranchState=${remoteBranchState}`);
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

  return true;
}

export async function updateShared(context) {
  setupLogger();
  const project = new Project(context);

  const headCommitID = await project.getCommitIDFromBranch(`master`);
  const parentCommitID = await project.getParentCommitID(headCommitID);
  const remoteURL = await project.getRemoteURL();

  syncLogger.info(`headCommitID=${headCommitID} parentCommitID=${parentCommitID}`);

  if (remoteURL === TEST_URL) {
    syncLogger.info(`${TEST_URL}, returning`);
    return branchState.BRANCH_STATE_HEAD;
  }

  const response = await axios.get(`${remoteURL}/checkhead`, {
    params: {
      headCommitID: headCommitID,
      parentCommitID: parentCommitID
    }
  });

  if (response.status === 404) {
    syncLogger.warn(`404`);
    return branchState.BRANCH_STATE_ERROR;
  }

  const currBranchState = response.data.branch_state;
  syncLogger.info(`currBranchState=${branchState.BRANCH_STATE_HEAD}`);

  if (currBranchState === branchState.BRANCH_STATE_HEAD) {
    return branchState.BRANCH_STATE_HEAD;
  } else if (currBranchState === branchState.BRANCH_STATE_AHEAD) {
    const handledAhead = await handleAhead(project, remoteURL, headCommitID, parentCommitID);
    if (handledAhead) {
      syncLogger.info(`updated remote`);
      return branchState.BRANCH_STATE_HEAD;
    } else {
      syncLogger.error(`did not update remote`, response);
      return branchState.BRANCH_STATE_AHEAD;
    }      
  } else if (currBranchState === branchState.BRANCH_STATE_BEHIND) {
    const updated = await getUpdateFromServer(project, remoteURL, headCommitID, parentCommitID);
    return updated ? branchState.BRANCH_STATE_HEAD : branchState.BRANCH_STATE_BEHIND;
  } else {
    return currBranchState;
  }
}

// TODO: move the sync function here

async function sync() {
  syncLogger.info("sync")
  setupLogger();
  turnSyncOff();
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
  syncLogger.info("done sync")
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