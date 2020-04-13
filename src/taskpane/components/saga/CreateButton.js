import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { runCreateSaga } from "../../../saga/create"

export default class CreateButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={runCreateSaga}
          >
            Create Saga
        </Button>
    );
  }
}
