import * as React from "react";
import TaskpaneHeaderLarge from "./TaskpaneHeaderLarge";
import TaskpaneHeaderSmall from "./TaskpaneHeaderSmall";
import TaskpaneFooter from "./TaskpaneFooter";
import { headerSize } from "../../constants";


/* 
    This component wraps a single screen. Takes a title and a single screen as a child.
*/
export default function Taskpane(props) {
    if (props.header == headerSize.SMALL) {
        return (
            <div className="taskpane">
                <TaskpaneHeaderSmall title={props.title}/>
                <div className="content">
                    {props.children}
                </div>
                <TaskpaneFooter/>
            </div>
        );
    }

    if (props.header == headerSize.LARGE) {
        return (
            <div className="taskpane">
                <TaskpaneHeaderLarge title={props.title}/>
                <div className="content">
                    {props.children}
                </div>
                <TaskpaneFooter/>
            </div>
        );
    } 
}