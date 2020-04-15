import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { runMerge } from "../../../saga/merge";


// This means merge into master
export default class MergeButton extends React.Component {
  render() {
    return (
        <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={async () => {
              await runMerge(this.props.formattingEvents);
              this.props.clearFormattingEvents();
            }}
          >
            Merge
        </Button>
    );
  }
}
