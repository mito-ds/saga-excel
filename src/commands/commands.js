/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { runSwitchVersionFromRibbon } from "../saga/checkout.js";
import { runResetPersonalVersion } from "../saga/resetPersonal.js";
import { runMerge } from "../saga/merge.js";
import { runCatchUp } from "../saga/diff.js";
import { taskpaneStatus, mergeState, operationStatus } from "../constants";

/* global global, Office, Excel */

// Save the formatting events
var events = [];

function formattingHandler(event) {
  events.push(event);
}

// If the operation errored and requires manual resolution, display screen
function displayErrorIfError(result) {
  // if the safetyCommit and safetyBranch are undefined, then we are in the correct state if the user deletes extra sheets
  if (result.status === operationStatus.ERROR_MANUAL_FIX && result.safetyCommit !== undefined && result.safetyBranch !== undefined) {
    window.app.setTaskpaneStatus(taskpaneStatus.ERROR_MANUAL_FIX);
    window.app.setSafetyValues(result.safetyCommit, result.safetyBranch);
    Office.addin.showAsTaskpane();
    return true;
  }
  
  // if cell editting mode error occurs before safety commit and safety branch
  if (result.status === operationStatus.ERROR_MANUAL_FIX || result.status === operationStatus.ERROR_AUTOMATICALLY_FIXED) {
    // TODO take to notification
    return true;
  }
  return false;
}

async function openShareTaskpane(event) {
  window.app.setTaskpaneStatus(taskpaneStatus.SHARE);
  Office.addin.showAsTaskpane();
  event.completed();
}

function openMergeTaskpane() {
  window.app.setTaskpaneStatus(taskpaneStatus.MERGE);
  Office.addin.showAsTaskpane();
}

Office.onReady(() => {
  Excel.run(function (context) {
    context.workbook.worksheets.onFormatChanged.add(formattingHandler);
    return context.sync();
  });
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
async function merge(event) {
  openMergeTaskpane();

  // update UI and execute merge
  window.app.setMergeState({status: mergeState.MERGE_IN_PROGRESS, conflicts: null});
  var result = await runMerge(events);

  if (!displayErrorIfError(result)) {
    window.app.setMergeState(result.operationResult);
  }

  // If this function was called by clicking the button, let Excel know it's done
  if (event) {
    event.completed();
  }
  events = [];
  return result.operationResult;
}

async function catchUp(event) {
  const result = await runCatchUp();

  if (!displayErrorIfError(result)) {
    // We set the diff state as well
    window.app.setSheetDiffs(result.operationResult);
    window.app.setTaskpaneStatus(taskpaneStatus.DIFF);
  }
  
  if (event) {
    event.completed();
  }
  return result.operationResult;
}

async function switchVersion(event) {
  // Todo: render message saying which branch they are on
  const result = await runSwitchVersionFromRibbon();

  displayErrorIfError(result); 
  
  if (event) {
    event.completed();
  }
}

async function resetPersonalVersion(event) {
  // Todo: If on master, tell them they can't
  const result = await runResetPersonalVersion();

  console.log(result);
  
  displayErrorIfError(result); 

  if (event) {
    event.completed();
  }
}

export function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

const g = getGlobal();

// the add-in command functions need to be available in global scope
g.merge = merge;
g.switchVersion = switchVersion;
g.resetPersonalVersion = resetPersonalVersion;
g.openShareTaskpane = openShareTaskpane;
g.catchUp = catchUp;
