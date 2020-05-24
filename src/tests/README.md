# Saga Embedded Testing 

This document provides a description on writing new tests for Saga.

# Write a New Test in an Existing Test Suite

To write a new test, simply export a test function from an existing test suite. 

# Create a New Test Suite

Create a file `newTestSuite.js` in the `tests/suites` folder, and then add an export line for this new test suite file to the `index.js` file.