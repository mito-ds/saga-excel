/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { runSwitchVersionFromRibbon } from "../saga/checkout.js"
import { runResetPersonalVersion } from "../saga/resetPersonal.js"
import { runMerge } from "../saga/merge.js"

/* global global, Office, Excel */

// Save the formatting events
var events = [];

function formattingHandler(event) {
  events.push(event);
}

async function openShareTaskpane(event) {
  window.appComponent.setContext("share")
  Office.addin.showAsTaskpane();
  event.completed();
}

function openMergeTaskpane() {
  window.appComponent.setContext("merge progress")
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
  console.log(events)
  openMergeTaskpane()
  //const mergeResponse = await runMerge(events);
  //window.appComponent.setContext(mergeResponse)
  window.appComponent.setContext("merge error")

  event.completed();
  events = [];
}

async function switchVersion(event) {
  // Todo: render message saying which branch they are on
  await runSwitchVersionFromRibbon();
  event.completed();
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


// the add-in command functions need to be available in global scope
g.merge = merge;
g.switchVersion = switchVersion;
g.resetPersonalVersion = resetPersonalVersion;
g.openShareTaskpane = openShareTaskpane;
