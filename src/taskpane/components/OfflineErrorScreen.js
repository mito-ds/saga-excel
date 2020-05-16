import * as React from "react";
import Taskpane from "./Taskpane";

// Login Form Component
export default class OfflineErrorScreen extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
        return (
            <Taskpane title="Sorry, you might be offline.">
                <div className="card-div">
                    Some of Saga's features need internet to work. Make sure you're connected to the internet and try again.
                </div>
            </Taskpane>
        );  
    }
}