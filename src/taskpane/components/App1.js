import React from "react";
import {
    HashRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
  

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }

        window.count = 0;
    }

    

    inc() {
        window.count += 1;
    }

    render() {
        return (
        <Router>
            <div>
            <Switch>
                <Route exact path="/main" render={(props) => <Comp name="Main" inc={this.inc} />} />
                <Route exact path="/side" render={(props) => <Comp name="Side" inc={this.inc} />} />
            </Switch>
            </div>
        </Router>
        );
    }
}


class Comp extends React.Component {
    render() {
    return (<div><button onClick={() => {this.props.inc(); this.forceUpdate();}}>Inc</button><p> {this.props.name} {window.count} </p></div>);
    }
}

export default App;


  