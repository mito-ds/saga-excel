import * as React from "react";


/*
  The mulitplayer scenario is null if there is no current scenario, or defined to be
  a MultiplayerScenario object if there is a scenario running currently.

  This is for demo mode; if you want to "interact with someone" without actually
  requring another party, use a multiplayer scenario.
*/
export const MultiplayerScenarioContext = React.createContext({
  scenario: null,
  setScenario: () => {}
});
