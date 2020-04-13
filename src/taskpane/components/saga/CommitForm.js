import * as React from "react";
import {runCommit} from "../../../saga/commit";

export default class CommitForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      message: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    //Then, create a new commit!
    runCommit(this.state.name, this.state.message);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Create Commit:
        </label>
          <input type="text" name="name" value={this.state.name} onChange={this.handleChange} placeholder="commit name" required/>        
          <input type="text" name="message" value={this.state.message} onChange={this.handleChange} placeholder="commit message" required/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
