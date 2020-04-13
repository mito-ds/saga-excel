import * as React from "react";
import {runRestoreCommit} from "../../../saga/restoreCommit";


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
    runRestoreCommit(this.state.commitID);
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
