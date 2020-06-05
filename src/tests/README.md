# Saga Embedded Testing 

This document provides a description on writing new tests for Saga.

## Write a New Test in an Existing Test Suite

To write a new test, simply export a test function from an existing test suite. 

## Create a New Test Suite

Create a file `newTestSuite.js` in the `tests/suites` folder, and then add an export line for this new test suite file to the `index.js` file.

## Create a new scenario

A scenario describes a specific state of an Excel workbook. To create a new scenario, get the workbook into the state you want to save, and click the "create scenario" button. 

Then, check the console, where a JSON object has been printed. Copy this object to a file in the scenarios folder, and then add an import and export to the JSON object from the `index.js` file in the scenarios folder.


## Multiplayer Testing

### Multiplayer Scenarios

While a scenario is the state of a specific workbook, a multiplayer testing scenario describes the evolution of a test case from the perspective of a single user. 

The format of a multi-player testing scenario is a JSON object with the following structure:
```
{
    "scenarioName": "<multi-player test scenario name>",
    "fileContents": "<original file contents>",
    "syncSteps": [
        {
            "scenarioName": "<multi-player test scenario name>",
            "stepNumber": 0,
            "fileContents": "<file contents base 64 string to sync>",
            "commitIDs": [<commit id 1>, ...],
            "commitSheets": [<commit sheet name 1>, ...]
        },
        ...
    ]
}
```

A `syncStep` represents a "pull from remote" - but as this information is stored in the scenario, we can skip any interact w/ the server and just pull in these commits locally. 

## Creating a Multiplayer Scenario

To create a multiplayer scenario, open (or create) any Saga project and copy its sharing link. Then, use the dev screen to enter a new multiplayer scenario name, and then press "start." This local instance will now record all incoming commits it pulls from remote. 

Then, open a new Excel instance and copy in the sharing link from the existing Saga project. Now, you can make changes in this new Excel instance, and merge them into the shared version. After each merge, or whenever you want to create a new sync step, go back to the original Excel instance, and the console will show it has saved a new sync step.

When you are finished with the scenario, click `finish`, and then copy the output into the `scenarios/multiplayer` folder, and export it from the `index.js` file there.

NOTE: due to limitations of the mulitplayer scenario process, you should not make changes to the original Excel instance that is recording the scenario creation process. Any operations you want to do to test must be done programmatically in the test case itself. Scenario creation is about remote changes

## Running a Multiplayer Scenario

The `testHelpers` file contains a helpful class for running a multiplayer scenario. First, construct a new scenario with the scenario name of the scenario you created above. Then, run it with `await scenario.start()`. This will set the state of the workbook to the starting state of the scenario.

Then, you can test whatever asserts you wish. When you want to sync the next data "from remote," simply call `await scenario.nextSyncStep()`, and the new changes will be pulled in.  