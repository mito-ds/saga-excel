/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { runSwitchVersionFromRibbon } from "../saga/checkout.js";
import { runResetPersonalVersion } from "../saga/resetPersonal.js";
import { runMerge } from "../saga/merge.js";
import { runCatchUp } from "../saga/diff.js";
import { taskpaneStatus, mergeState } from "../constants";
import { sagaProjectExists } from "../saga/sagaUtils.js"

/* global global, Office, Excel */

// Save the formatting events
var events = [];

function formattingHandler(event) {
  events.push(event);
}

function openMergeTaskpane() {
  window.app.setTaskpaneStatus(taskpaneStatus.MERGE);
  Office.addin.showAsTaskpane();
}

async function openShareTaskpane(event) {
  const sagaExists = await isSagaProject();
  if (sagaExists) {
    window.app.setTaskpaneStatus(taskpaneStatus.SHARE);
    Office.addin.showAsTaskpane();
  }
  
  event.completed();
}

async function isSagaProject() {
  const projectExists = await sagaProjectExists();
  if (!projectExists) {
    window.app.setTaskpaneStatus(taskpaneStatus.CREATE);
    Office.addin.showAsTaskpane();
    return false;
  } 

  return true; 
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
  const sagaExists = await isSagaProject();
  if (sagaExists) {
    console.log("SAGA PROJECT EXISTS");
    openMergeTaskpane();

    // update UI and execute merge
    window.app.setMergeState({status: mergeState.MERGE_IN_PROGRESS, conflicts: null});
    var mergeResult = await runMerge(events);
    window.app.setMergeState(mergeResult);
  }

  // If this function was called by clicking the button, let Excel know it's done
  if (event) {
    event.completed();
  }
  events = [];
  return mergeResult;
}

async function catchUp(event) {
  let sheetDiffs = "";
  const sagaExists = await isSagaProject();
  if (sagaExists) {
    sheetDiffs = await runCatchUp();

    // We set the diff state as well
    window.app.setSheetDiffs(sheetDiffs);
    window.app.setTaskpaneStatus(taskpaneStatus.DIFF);
  }

  if (event) {
    event.completed();
  }
  return sheetDiffs;
}

async function switchVersion(event) {
  const sagaExists = await isSagaProject();
  if (sagaExists) {
    // Todo: render message saying which branch they are on
    await runSwitchVersionFromRibbon();
  }

  if (event) {
    event.completed();
  }
}

async function resetPersonalVersion(event) {
  const sagaExists = await isSagaProject();
  if (sagaExists) {
    // Todo: If on master, tell them they can't
    await runResetPersonalVersion();
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
g.merge = merge;
g.switchVersion = switchVersion;
g.resetPersonalVersion = resetPersonalVersion;
g.openShareTaskpane = openShareTaskpane;
g.catchUp = catchUp;
