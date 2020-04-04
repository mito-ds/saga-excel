import * as React from "react";
import {commit} from "./commit";

/* global Button, console, Excel */

async function makeNewCommit(name, message) {
    try {
        console.log("trying to commit")
        await Excel.run(async context => {
            await commit(context, name, message);
        });
      } catch (error) {
        console.error(error);
        if (error instanceof OfficeExtension.Error) {
            console.error(error.debugInfo);
        }
    }
}


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
    makeNewCommit(this.state.name, this.state.message);
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
