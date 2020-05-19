import * as React from "react";
import './App.css';


/* global */

export default class TaskpaneHeaderLarge extends React.Component {
    render() {
        return (
            <div className="header">
                <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                <p className="title-text" id="title-text" >{this.props.title}</p>
            </div>
        )
    }
}
