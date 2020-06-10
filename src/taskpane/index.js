import "office-ui-fabric-react/dist/css/fabric.min.css";
import App from "./components/App";
import { AppContainer } from "react-hot-loader";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";

/* global Office, Excel, module, require */

initializeIcons();

let isOfficeInitialized = false;

const title = "Saga Version Control";

/*
  This sets the app functions in the global scope
  so that the taskpane can call them.
*/
function setupTaskpaneFunctions(app) {
  if (!app) {
    return;
  }

  window.merge = app.merge;
  window.resetPersonalVersion = app.resetPersonalVersion;
  window.switchVersion = app.switchVersion;
  window.catchUp = app.catchUp;
  window.openShareTaskpane = app.openShareTaskpane;
  window.formattingHandler = app.formattingHandler;
}


const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component 
        title={title} 
        isOfficeInitialized={isOfficeInitialized} 
        ref={(app) => {
          window.app = app;
          setupTaskpaneFunctions(app);
        }
      } />
    </AppContainer>,
    document.getElementById("container")
  );
};

window.formattingEvents = [];

function formattingHandler(event) {
  window.formattingEvents.push(event);
}

/* Render application after Office initializes */
Office.initialize = () => {
  isOfficeInitialized = true;
  render(App);

  // Also, register the formatting handler
  Excel.run(function (context) {
    context.workbook.worksheets.onFormatChanged.add(formattingHandler);
    return context.sync();
  });
};

/* Initial render showing a progress bar */
render(App);

if (module.hot) {
  module.hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    render(NextApp);
  });
}
