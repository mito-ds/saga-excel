# Saga Embedded Testing 

This document provides a description on writing new tests for Saga.

## Write a New Test in an Existing Test Suite

To write a new test, simply export a test function from an existing test suite. 

## Create a New Test Suite

Create a file `newTestSuite.js` in the `tests/suites` folder, and then add an export line for this new test suite file to the `index.js` file.

## Create a new scenario

A scenario describes a specific state of an Excel workbook. To create a new scenario, get the workbook into the state you want to save, and click the "create scenario" button. 

Then, check the console, where a JSON object has been printed. Copy this object to a file in the scenarios folder, and then add an import and export to the JSON object from the `index.js` file in the scenarios folder.


## Create a multi-player testing scenario

While a scenario is the state of a specific workbook, a multi-player testing scenario describes the evolution of a test case from the perspective of a single user. 

The format of a multi-player testing scenario is a JSON object with the following structure:
```
{
    scenarioName: "<multi-player test scenario name>",
    syncSteps: [
        {
            scenarioName: "<multi-player test scenario name>",
            stepNumber: 0,
            fileContents: "<file contents base 64 string to sync>",
            commitIDs: [<commit id 1>, ...],
            commitSheets: [<commit sheet name 1>, ...]
        },
        ...
    ]
}
```

Scenario generation coming soon!