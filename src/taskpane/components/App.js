import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import {getFileContent} from "../../fileUtils";
import CreateButton from "./saga/CreateButton";
import DebugButton from "./saga/DebugButton";
import CommitButton from "./saga/CommitButton";
import CleanupButton from "./saga/CleanupButton";
import CreateBranchInput from "./saga/CreateBranchInput";
import CheckoutBranchInput from "./saga/CheckoutInput";
import MergeBranchInput from "./saga/MergeBranchInput";
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

  sendFile = async () => {
    try {
      const fileContent = await getFileContent();
      console.log("Got file, ", fileContent);
      const response = await postData(
        "https://excel.sagalab.org/file", 
        {
          "fileContent": fileContent
        }
      )
      console.log(response);
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
      }
    }
  };

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
          <CreateButton/>
          <CleanupButton/>
          <DebugButton/>
          <CommitButton/>
          <CreateBranchInput/>
          <CheckoutBranchInput/>
          <MergeBranchInput/>
        </HeroList>
      </div>
    );
  }
}
