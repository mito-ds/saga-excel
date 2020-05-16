import * as React from "react";
import { taskpaneStatus } from "../../constants";

export const StatusContext = React.createContext({
  status: taskpaneStatus.CREATE,
  setStatus: () => {}
});
