import "office-ui-fabric-react/dist/css/fabric.min.css";
import App from "./components/App1";
import { AppContainer } from "react-hot-loader";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { route } from "../constants";

/* global Office, module, require */

initializeIcons();

let isOfficeInitialized = false;

const title = "Saga Version Control";

function main(event) {
  window.app.setRoute(route.MAIN);
  Office.addin.showAsTaskpane();
  event.completed();
}

function side(event) {
  window.app.setRoute(route.SIDE);
  Office.addin.showAsTaskpane();
  event.completed();
}

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component title={title} isOfficeInitialized={isOfficeInitialized} ref={
        (app) => {
          window.app = app;
          window.main = main;
          window.side = side;
        }} />
    </AppContainer>,
    document.getElementById("container")
  );
};

/* Render application after Office initializes */
Office.initialize = () => {
  isOfficeInitialized = true;
  render(App);
};

/* Initial render showing a progress bar */
render(App);

if (module.hot) {
  module.hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    render(NextApp);
  });
}
