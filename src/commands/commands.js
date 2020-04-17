/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { runCreateSaga} from "../saga/create"
import { runSwitchVersionFromRibbon } from "../saga/checkout.js"
import { runResetPersonalVersion } from "../saga/resetPersonal.js"
import { getCurrentBranchNameFromRibbon } from "../saga/branch.js"
import { runMerge } from "../saga/merge.js"

/* global global, Office, Excel */

// Save the formatting events
var events = [];

function formattingHandler(event) {
  events.push(event);
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
  await runMerge(events);
  event.completed();
  events = [];
}

async function switchVersion(event) {
  // Todo: render message saying which branch they are on
  await runSwitchVersionFromRibbon();
  const headBranch = await getCurrentBranchNameFromRibbon();
  console.log("headBranch")
  console.log(headBranch)

  if (headBranch === 'master') {
    toggleButtons(disableMergeAndResetObj)
  } else {
    toggleButtons(enableMergeAndResetObj)
  }
  event.completed();
}

async function resetPersonalVersion(event) {
  // Todo: If on master, tell them they can't
  await runResetPersonalVersion(); 
  event.completed();
}


function toggleButtons(buttonUpdateObj) {
  Office.ribbon.requestUpdate(buttonUpdateObj);
}

const enableMergeAndResetObj = {
    tabs: [
        {
            id: "TabHome", 
            controls: [
            {
                id: "MergeButton", 
                enabled: true
            }, 
            {   
                id: "ResetPersonalButton", 
                enabled: true
            }
        ]}
    ]
  };

const disableMergeAndResetObj = {
    tabs: [
        {
            id: "TabHome", 
            controls: [
            {
                id: "MergeButton", 
                enabled: false
            }, 
            {   
                id: "ResetPersonalButton", 
                enabled: false
            }
        ]}
    ]
  };

function getGlobal() {
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
