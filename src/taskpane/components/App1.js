import React from "react";
import {
    HashRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import { route } from "../../constants"; 

  

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            route: route.MAIN
        };

        this.setRoute = this.setRoute.bind(this);
    }

    setRoute(route) {
        this.setState({
            route: route
        });
    }

    render() {
        let toReturn;
        switch (this.state.route) {
            case route.MAIN:
                toReturn = <Comp name="Main"/>;
                break;
            case route.SIDE:
                toReturn = <Comp name="Side"/>;
                break;
        }

        return toReturn;
    }
}


class Comp extends React.Component {
    render() {
    return (<div><p> {this.props.name} {window.count} </p></div>);
    }
}

export default App;


  