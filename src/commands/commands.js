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
  var mergeResult = await runMerge(events);
  window.app.setMergeState(mergeResult);

  // If this function was called by clicking the button, let Excel know it's done
  if (event) {
    event.completed();
  }
  events = [];
  return mergeResult;
}

async function catchUp(event) {
  const sheetDiffs = await runCatchUp();
  console.log("Sheetdiffs", sheetDiffs);
  // We set the diff state as well
  window.app.setSheetDiffs(sheetDiffs);
  console.log("catching up in commands");
  window.app.setTaskpaneStatus(taskpaneStatus.DIFF);
  
  if (event) {
    event.completed();
  }
  return sheetDiffs;
}

// If the operation errored and requires manual resolution, display screen
function showManualFixErrorScreen(safetyCommit, safetyBranch) {
  console.log("running helper function");
  window.app.setTaskpaneStatus(taskpaneStatus.ERROR_MANUAL_FIX);
  window.app.setSafetyValues(safetyCommit, safetyBranch);
  Office.addin.showAsTaskpane();
}

async function switchVersion(event) {
  // Todo: render message saying which branch they are on
  const result = await runSwitchVersionFromRibbon();

  console.log(result);

  console.log(result.status);

  if (result.status === operationStatus.ERROR_MANUAL_FIX) {
    console.log(result.safetyCommit);
    console.log(result.safetyBranch);

    showManualFixErrorScreen(result.safetyCommit, result.safetyBranch);
  }
  
  if (event) {
    event.completed();
  }
}

async function resetPersonalVersion(event) {
  // Todo: If on master, tell them they can't
  await runResetPersonalVersion();
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
