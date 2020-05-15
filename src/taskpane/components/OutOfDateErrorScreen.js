import * as React from "react";
import Taskpane from "./Taskpane";

// Login Form Component
export default class OutOfDateErrorScreen extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
        return (
            <Taskpane title="Sorry, your Excel isn't up to date.">
                <div className="card-div">
                    Some of Saga's features need a more recent Excel version to work. Please reach out if you think this is a mistake.
                </div>
            </Taskpane>
        );  
    }
}