/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { createSaga } from "../taskpane/components/saga/CreateButton";



/* global global, Office, self, window */


Office.onReady(() => {
  console.log("Office is ready")
  // If needed, Office.js is ready to be called
});

//The initialize function must be run each time a new page is loaded
(function () {
  Office.initialize = function (reason) {
     //If you need to initialize something you can do so here. 
  };
})();

//Notice function needs to be in global namespace
async function writeText(event) {
  await createSaga();
  await event.completed();
}

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
function action(event) {
  const message = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: "Performed action.",
    icon: "Icon.80x80",
    persistent: true
  };

  // Show a notification message
  Office.context.mailbox.item.notificationMessages.replaceAsync("action", message);

  // Be sure to indicate when the add-in command function is complete
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
g.writeText = writeText;
