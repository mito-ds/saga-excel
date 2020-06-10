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
function checkResultForError(result) {
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


Office.onReady(() => {
  Excel.run(function (context) {
    context.workbook.worksheets.onFormatChanged.add(formattingHandler);
    return context.sync();
  });
});

async function catchUp(event) {
  const result = await runCatchUp();

  if (!checkResultForError(result)) {
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


  if (!checkResultForError(result)) {
    window.app.setBranch(result.operationResult);
    window.app.setTaskpaneStatus(taskpaneStatus.SWITCH);
    Office.addin.showAsTaskpane();
  }
  
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
//g.merge = window.app.merge;
g.switchVersion = switchVersion;
//g.resetPersonalVersion = window.app.resetPersonalVersion;
g.openShareTaskpane = openShareTaskpane;
g.catchUp = catchUp;
