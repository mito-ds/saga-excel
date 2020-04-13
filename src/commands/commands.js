/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

//import {createSaga} from "../taskpane/components/saga/CreateButton";

/* global global, Office, Excel */

Office.onReady(() => {
  // If needed, Office.js is ready to be called
  console.log("HERE")
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
async function action(event) {
  // TEST
  Excel.run(async context => {
    console.log("RUNNING EXCEL SHIT");
    await context.sync();
    event.completed();
  })
}

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
g.action = action;
