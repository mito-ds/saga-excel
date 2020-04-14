/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { runCreateSaga } from "../saga/create"
import { runSwitchVersionFromRibbon } from "../saga/checkout.js"

/* global global, Office */

Office.onReady(() => {
  // If needed, Office.js is ready to be called
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
async function action(event) {
  await runCreateSaga();
  event.completed();
}

async function switchVersion(event) {
  await runSwitchVersionFromRibbon()
  event.completed();
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
g.switchVersion = switchVersion;
