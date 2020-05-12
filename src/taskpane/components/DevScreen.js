import * as React from "react";
import Taskpane from "./Taskpane";
import { StatusContext } from "./StatusContext";
import { runCleanup } from "../../saga/cleanup";
import { runTests } from "../../tests/runTests";

// Login Form Component

export default function DevScreen(props) {
    const {status, setStatus} = React.useContext(StatusContext);
    return (
        <Taskpane title="Invite people to collaborate by sending them the Saga project link.">
            <button onClick={() => {runTests()}}> Run Tests </button>
            <button onClick={() => {runCleanup()}}> Cleanup </button>
        </Taskpane>
    );


}