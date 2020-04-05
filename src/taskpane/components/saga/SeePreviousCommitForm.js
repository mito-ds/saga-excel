import * as React from "react";
import {restoreCommit} from "./restoreCommit";

/* global Button, console, Excel */

async function seePreviousCommit(commitID) {
    try {
        console.log("trying to restore commit")
        await Excel.run(async context => {
            await restoreCommit(context, commitID);
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }
}


export default class SeePreviousCommitForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commitID: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    //Then, see a previous commit!
    seePreviousCommit(this.state.commitID);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          See Previous Commit:
        </label>
          <input type="text" name="commitID" value={this.state.name} onChange={this.handleChange} placeholder="commitID" required/>        
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
