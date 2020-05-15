import * as React from "react";
import Taskpane from "./Taskpane";
import { StatusContext } from "./StatusContext";
import { runCleanup } from "../../saga/cleanup";
import { runTests } from "../../tests/runTests";
import { headerSize } from "../../constants";


// Login Form Component

export default function DevScreen(props) {
    const {status, setStatus} = React.useContext(StatusContext);
    return (
        <Taskpane header={headerSize.LARGE} title="Development Mode. NOTE: Run from an empty Excel workbook with no saga project">
            <button onClick={() => {runTests()}}> Run Tests </button>
            <button onClick={() => {runCleanup()}}> Cleanup </button>
        </Taskpane>
    );


}