import * as React from "react";
import { mergeBranch } from "./merge";

/* global console, Excel */


async function runMergeBranch(branch) {
  try {
    await Excel.run(async context => {
        await mergeBranch(context, branch);
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
    }
  }
}


export default class MergeBranchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    // Then, create a new branch!
    runMergeBranch(this.state.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Merge Branch:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
