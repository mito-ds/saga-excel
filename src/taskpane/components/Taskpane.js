import * as React from "react";
import TaskpaneHeader from "./TaskpaneHeader";
import TaskpaneFooter from "./TaskpaneFooter";

/* 
    This component wraps a single screen. Takes a title and a single screen as a child.
*/
export default function Taskpane(props) {
    return (
        <div className="taskpane">
            <TaskpaneHeader title={props.title}/>
            <div className="content">
                {props.children}
            </div>
            <TaskpaneFooter/>
        </div>
    );
}