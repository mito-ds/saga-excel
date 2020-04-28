import * as React from "react";
import TaskpaneHeader from "./TaskpaneHeader";
import TaskpaneFooter from "./TaskpaneFooter";

/* 
    This component wraps a single screen. Takes a title and a single screen as a child.
*/
export default class Taskpane extends React.Component {
    constructor(props) {
        super(props);    }

    render () {
        return (
            <div className="taskpane">
                <TaskpaneHeader title={this.props.title}/>
                <div className="content">
                    {this.props.children}
                </div>
                <TaskpaneFooter/>
            </div>
        );
    }
}