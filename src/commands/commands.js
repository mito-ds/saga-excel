/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */


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
  });
});



export function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

