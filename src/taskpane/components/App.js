import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import {getFileContents} from "../../fileUtils";
import CreateButton from "./saga/CreateButton";
import DebugButton from "./saga/DebugButton";
import SeePreviousCommitForm from "./saga/SeePreviousCommitForm";
import CommitForm from "./saga/CommitForm";
import CleanupButton from "./saga/CleanupButton";
import CreateBranchInput from "./saga/CreateBranchInput";
import CheckoutBranchInput from "./saga/CheckoutInput";
import MergeBranchInput from "./saga/MergeBranchInput";
import {updateShared} from './saga/sync';
import $ from "jquery";


/* global Button, console, Excel, Header, HeroList, HeroListItem, Progress */

async function postData(url, data) {
  // Default options are marked with *
  console.log("POSTING DATA:", data);

  const response = await $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: JSON.stringify(data)
  }).promise();
  return response;
}

async function getData(url, data) {
  // Default options are marked with *
  console.log("GETTING DATA:", data);

  const response = await $.ajax({
    type: "GET",
    url: url,
    contentType: "application/json",
    data: JSON.stringify(data)
  }).promise();
  return response;
}


export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: []
    };
  }

  componentDidMount() {
    this.setState({
      listItems: [
        {
          icon: "Ribbon",
          primaryText: "Achieve more with Office integration"
        },
        {
          icon: "Unlock",
          primaryText: "Unlock features and functionality"
        },
        {
          icon: "Design",
          primaryText: "Create and visualize like a pro"
        }
      ]
    });
  }

  setVisibility = async () => {
    console.log("Setting Visibility");
    try {
      await Excel.run(async context => {
        const worksheet1 = context.workbook.worksheets.getItemOrNullObject("saga");
        const worksheet2 = context.workbook.worksheets.getItemOrNullObject("saga-commits");

        await toggleVisibility(context, worksheet1);
        await toggleVisibility(context, worksheet2);

        return context.sync();
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
      }
    }
  };

  testStorage = () => {
    // TODO: save something in storage.
    const sessionStorage = window.sessionStorage;
    if (sessionStorage.getItem("value")) {
      // Restore the contents of the text field
      console.log(`value is ${sessionStorage.getItem("value")}`);
    } else {
      console.log(`value is no defined`);
    }

    sessionStorage.setItem("value", 2);
  }

  testInsertBase64 = async () => {
    try {
      await Excel.run(async context => {
        // get the base 64 for the document and print it
        console.log(Office.context.requirements);


        const fileContent1 = await getFileContents();
        // change a value, see if the base 64 changes without updating anything

        console.log(fileContent1);
        const sheets = context.workbook.worksheets;
        sheets.addFromBase64(
            fileContent1,
            [], 
            Excel.WorksheetPositionType.after, // insert them after the worksheet specified by the next parameter
            sheets.getActiveWorksheet() // insert them after the active worksheet
        );

      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
          console.error(error.debugInfo);
      }
    }    
  }

  updateShared = async () => {
    console.log(`pushing`)
    try {
      await Excel.run(async context => {
        await updateShared(context);
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
          console.error(error.debugInfo);
      }
    } 
  }

  testPull = async () => {
    console.log(`pushing`)
    try {
      await Excel.run(async context => {
        // First, we get the ID
        const remoteRange = context.workbook.worksheets.getItemOrNullObject("saga").getRange("B2");
        remoteRange.load('values');
        await context.sync();
        var remoteURL = remoteRange.values[0][0];
        const id = remoteURL.split("/")[remoteURL.split("/").length - 1];

        // Then, we make a get request with that ID to the remote server
        const response = await getData(
          remoteURL,
          {
            "id": id
          }
        )

        const fileContents = response.fileContents;
        console.log(fileContents);

        // TODO: actually figure out which of the sheets we keep and which we don't
        const sheets = context.workbook.worksheets;
        sheets.addFromBase64(
          fileContents,
          null, 
          Excel.WorksheetPositionType.after, // insert them after the worksheet specified by the next parameter
          sheets.getActiveWorksheet() // insert them after the active worksheet
        );

        await context.sync();
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
          console.error(error.debugInfo);
      }
    } 
  }




  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/logo-filled.png" message="Please sideload your addin to see app body." />
      );
    }
    return (
      <div className="ms-welcome">
        <Header logo="assets/logo-filled.png" title={this.props.title} message="Saga VCS" />
        <HeroList message="Welcome to saga." items={[]}> 
          <p className="ms-font-l">
            Use the buttons to interact with <b>Saga</b>.
          </p>
          <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={this.testStorage}
          >
            Test Storage
          </Button>
          <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={this.testInsertBase64}
          >
            Test Insert Base64
          </Button>
          <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={this.updateShared}
          >
            updateShared
          </Button>
          <Button
            className="ms-welcome_Action"
            buttonType={ButtonType.hero}
            iconProps={{ iconName: "ChevronRight" }}
            onClick={this.testPull}
          >
            Test Pull
          </Button>

          <CreateButton/>
          <CleanupButton/>
          <DebugButton/>
          <CommitForm/>
          <CreateBranchInput/>
          <CheckoutBranchInput/>
          <MergeBranchInput/>
          <SeePreviousCommitForm/>
        </HeroList>
      </div>
    );
  }
}
