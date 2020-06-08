import * as React from "react";
import Taskpane from "./Taskpane";
import { headerSize } from "../../constants";

export default function SwitchScreen(props) {

    let str;
    if (props.branch === "personal") {
        str = `You are now on your personal version.`;
    } else {
        str = `You are now on the shared version.`;
    }
    
    return (
        <Taskpane header={headerSize.LARGE} title={str}>
        </Taskpane>
    );
}