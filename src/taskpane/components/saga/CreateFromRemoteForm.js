import * as React from "react";
import { runCreateFromURL } from "../../../saga/create"




export default class CreateFromRemoteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    runCreateFromURL(this.state.url);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          From Remote URL:
        </label>
          <input type="text" name="url" value={this.state.url} onChange={this.handleChange} placeholder="remote url" required/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
