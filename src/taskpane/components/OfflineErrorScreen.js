import * as React from "react";

// Login Form Component
export default class OfflineErrorScreen extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
        return (
            <div className="content">
                <div className="header">
                    <img className="saga-logo" src="assets/saga-logo/saga-logo-taskpane.png"/>
                    <p className="title-text" id="title-text" >Sorry, you might be offline. </p>
                </div>
                <div className="card-div">
                    Some of Saga's features need internet to work. Make sure you're connected to the internet and try again.
                </div>
            </div>
        );  
    }
}