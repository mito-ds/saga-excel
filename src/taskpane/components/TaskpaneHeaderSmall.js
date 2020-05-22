import * as React from "react";
import './TaskpaneHeaderSmall.css';


/* global */

export default class TaskpaneHeaderLarge extends React.Component {
    render() {
        return (
            <div className="header-small">
                <img className="saga-logo-small" src="assets/saga-logo/saga-logo-80.png"/>
                <p className="title-text-small" id="title-text" >{this.props.title}</p>
            </div>
        );
    }
}
