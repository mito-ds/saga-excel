import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import {diff3Merge, diff3Merge2d} from "../../merge";
import {longestCommonSubsequence2d} from "../../lcs";
import {getFileContent} from "../../fileUtils";
import CreateButton from "./saga/CreateButton";
import DebugButton from "./saga/DebugButton";
import CommitButton from "./saga/CommitButton";
import CleanupButton from "./saga/CleanupButton";
import CreateBranchInput from "./saga/CreateBranchInput";
import CheckoutBranchInput from "./saga/CheckoutInput";
import $ from "jquery";

/* global Button, console, Excel, Header, HeroList, HeroListItem, Progress */

async function getFormulas(context, sheetName) {
  // Get's the defined range and prints it
  var sheet = context.workbook.worksheets.getItem(sheetName);
  var usedRange = sheet.getUsedRange(true);
  // Have to load and then sync to run the command
  usedRange.load("formulas")
  await context.sync();
  return usedRange.formulas;
}

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

  createData = async () => {
    try {
      await Excel.run(async context => {

        // Fills in the first row of the first sheet with some fake data
        var sheet = context.workbook.worksheets.getItem("origin");
        sheet.getRange("A1").values = [[ "A" ]];
        sheet.getRange("B1").values = [[ "B" ]];
        sheet.getRange("C1").values = [[ "C" ]];

        var sheet = context.workbook.worksheets.getItem("a");
        sheet.getRange("A1").values = [[ "A" ]];
        sheet.getRange("B1").values = [[ "B" ]];
        sheet.getRange("C1").values = [[ "C" ]];
        sheet.getRange("E1").values = [[ "INSERT" ]];

        var sheet = context.workbook.worksheets.getItem("b");
        sheet.getRange("A1").values = [[ "A" ]];
        sheet.getRange("B1").values = [[ "CHANGE" ]];
        sheet.getRange("C1").values = [[ "C" ]];

        // Clear the merge sheet
        var sheet = context.workbook.worksheets.getItem("merge");
        sheet.getUsedRange(true).clear();

        console.log("CREATE DATA");

        await context.sync();
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
      }
    }
  };

  merge = async () => {
    try {
      await Excel.run(async context => {
        const originFormulas = await getFormulas(context, "origin");
        const aFormulas = await getFormulas(context, "a");
        const bFormulas = await getFormulas(context, "b");
        console.log("MERGE:", originFormulas);
        console.log("MERGE:", aFormulas);
        console.log("MERGE:", bFormulas);

        const merge = diff3Merge(originFormulas[0], aFormulas[0], bFormulas[0]);
        const data = [merge]; // lists of lists
        console.log("MERGE:", data);
        var sheet = context.workbook.worksheets.getItem("merge");
        const range = sheet.getRange("A1:E1");
        range.values = data;

        await context.sync();
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
      }
    }
  };

  twoDim = async () => {
    try {
      await Excel.run(async context => {
        const originFormulas = await getFormulas(context, "origin");
        const aFormulas = await getFormulas(context, "a");
        const bFormulas = await getFormulas(context, "b");
        const merge = diff3Merge2d(originFormulas, aFormulas, bFormulas);
        console.log("TWO DIM:", merge);
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
        console.error(error.debugInfo);
      }
    }
  };

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
        </HeroList>
      </div>
    );
  }
}
