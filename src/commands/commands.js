/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { runSwitchVersionFromRibbon } from "../saga/checkout.js"
import { runResetPersonalVersion } from "../saga/resetPersonal.js"
import { runMerge } from "../saga/merge.js"
import { taskpaneStatus, mergeState } from "../constants";

/* global global, Office, Excel */

// Save the formatting events
var events = [];

function formattingHandler(event) {
  events.push(event);
}

async function openShareTaskpane(event) {
  window.app.setTaskpaneStatus(taskpaneStatus.SHARE)
  Office.addin.showAsTaskpane();
  event.completed();
}

function openMergeTaskpane() {
  window.app.setTaskpaneStatus(taskpaneStatus.MERGE)
  Office.addin.showAsTaskpane();
}

Office.onReady(() => {
  Excel.run(function (context) {
    context.workbook.worksheets.onFormatChanged.add(formattingHandler);
    return context.sync();
  })
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
async function merge(event) {
  openMergeTaskpane()
  window.app.setTaskpaneStatus(taskpaneStatus.MERGE);
  window.app.setMergeState(mergeState.MERGE_IN_PROGRESS);
  var mergeResult = await runMerge(events);
  console.log(mergeResult)
  window.app.setMergeState(mergeResult);
  /*
  const fakeMergeState = {
    result: mergeState.MERGE_CONFLICT,
    conflicts: conflicts
  }
  window.app.setMergeState(fakeMergeState);
  */


  // If this function was called by clicking the button, let Excel know it's done
  if (event) {
    event.completed();
  }
  events = [];
  return mergeResult;
}

async function switchVersion(event) {
  // Todo: render message saying which branch they are on
  await runSwitchVersionFromRibbon();
  
  if (event) {
    event.completed();
  }
}

async function resetPersonalVersion(event) {
  // Todo: If on master, tell them they can't
  await runResetPersonalVersion(); 
  event.completed();
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

const conflicts = [
  { 
    cell: "Sheet1 B5",
    a: "=aaaaa",
    b: "=b", 
    o: "=o"
  },
  {     
    cell: "Sheet1 D7",
    a: "=a2",
    b: "=b2", 
    o: "=o2"
  }, 
  {     
    cell: "Sheet1 E7",
    a: "=a3",
    b: "=b3", 
    o: "=o3"
  },
  {     
    cell: "Sheet1 F9",
    a: "=a4",
    b: "=b4", 
    o: "=o4"
  },
  {     
    cell: "Sheet1 G3",
    a: "=a5",
    b: "=b5", 
    o: "=o5"
  },
  {     
    cell: "Sheet1 L100",
    a: "=a6",
    b: "=b7", 
    o: "=o8"
  }
]


// the add-in command functions need to be available in global scope
g.merge = merge;
g.switchVersion = switchVersion;
g.resetPersonalVersion = resetPersonalVersion;
g.openShareTaskpane = openShareTaskpane;
