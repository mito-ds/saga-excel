import * as React from "react";
import Header from "./Header";
import HeroList from "./HeroList";
import Progress from "./Progress";
import CreateButton from "./saga/CreateButton";
import SeePreviousCommitForm from "./saga/SeePreviousCommitForm";
import CommitForm from "./saga/CommitForm";
import CleanupButton from "./saga/CleanupButton";
import CreateBranchInput from "./saga/CreateBranchInput";
import CheckoutBranchInput from "./saga/CheckoutInput";
import MergeButton from "./saga/MergeButton";
import VisibleButton from "./saga/VisibleButton";
import EmptyButton from "./saga/EmptyButton";
import CreateFromRemoteForm from './saga/CreateFromRemoteForm'
import ResetPersonalButton from './saga/ResetPersonalButton'

/* global Excel */

var formattingEvents = [];

function formattingHandler(event) {
  formattingEvents.push(event);
  console.log(formattingEvents);
}

function registerFormattingHandler() {
  Excel.run(function (context) {
    context.workbook.worksheets.onChanged.add(formattingHandler);

    return context.sync();
})
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
            Use the buttons to interact with Saga.
          </p>
          <CreateButton/>
          <CleanupButton/>
          <MergeButton/>
          <VisibleButton/>
          <EmptyButton function={registerFormattingHandler} message={"register"}/>
          <CommitForm/>
          <CreateBranchInput/>
          <CheckoutBranchInput/>
          <SeePreviousCommitForm/>
          <CreateFromRemoteForm/>
          <ResetPersonalButton/>
        </HeroList>
      </div>
    );
  }
}
