import React from "react";
import {
    HashRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
  

class App extends React.Component {

    render() {
        return (
        <Router>
            <div>
            <Switch>
                <Route exact path="/main" component={Main} />
                <Route exact path="/side" component={Side} />

            </Switch>
            </div>
        </Router>
        );
    }
}


const Main = () => {return (<p> Main </p>);};
const Side = () => {return (<p> Side </p>);};

export default App;


  