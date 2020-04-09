import * as React from "react";
import Project from './Project';
import { getSheetsWithNames } from "./sagaUtils";
import axios from "axios"


/* global Button, console, Excel */

async function createFromURL(url) {
  try {
      await Excel.run(async context => {
        const project = new Project(context);
        const sheets = await getSheetsWithNames(context);

        for (let i = 1; i < sheets.length; i++) {
          sheets[i].delete();
        }

        sheets[0].name = "saga-tmp"

        await context.sync()

        const response = await axios.get(
          url, 
          {
            params: {
              headCommitID: ``,
              parentCommitID: ``
            }
          }
        );

        if (response.status === 404) {
          console.error(`No project exists as ${url}`);
        }

        const fileContents = response.data.fileContents;
        console.log(`FILE CONTENTS ${fileContents}`)

        const worksheets = context.workbook.worksheets;
        worksheets.addFromBase64(
          fileContents
        );

        sheets[0].delete();
        await context.sync();
        
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
          console.error(error.debugInfo);
      }
  }
}


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
    createFromURL(this.state.url);
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
