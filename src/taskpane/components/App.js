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
import axios from "axios";

/* global Excel */


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {events: []};

    this.clearEvents = this.clearEvents.bind(this);
    this.formattingHandler = this.formattingHandler.bind(this);
    this.registerFormattingHandler = this.registerFormattingHandler.bind(this);
  }

  clearEvents = (event) => {
    this.setState({events: []});
  }

  formattingHandler = (event) => {
    this.setState((state, props) => {
      const newEvents = state.events.concat([event]);
      return {events: newEvents};
    });
  }

  registerFormattingHandler = async () => {
    var handler = this.formattingHandler;
    await Excel.run(function (context) {
      context.workbook.worksheets.onFormatChanged.add(handler);
      return context.sync();
    })
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
          <MergeButton formattingEvents={this.state.events} clearFormattingEvents={this.clearEvents}/>
          <VisibleButton/>
          <EmptyButton function={this.registerFormattingHandler} message={"register"}/>
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
