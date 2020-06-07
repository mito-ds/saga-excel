import * as testSuites from "./index";
import { runCleanup } from "../saga/cleanup";

/* global */

export async function runTestSuite(testSuiteName, testName) {

    console.log(`%cRunning test suites ${testSuiteName}:\n`, "color: orange;");

    if (!(testSuiteName in testSuites)) {
        console.log(`%cNo test suite ${testSuiteName} exists`, "color: red;");
        return;
    }

    const tests = testSuites[testSuiteName];
    let testNames = Object.keys(tests);

    // If a single test name was given, only run that test
    if (testName !== undefined) {
        testNames = [testName];
    }


    var results = "";
    var numFailed = 0;
    var failed = {};
    var output = {};
    
    for (let i = 0; i < testNames.length; i++) {
        console.log(`%cRunning test ${testNames[i]}:\n`, "color: orange;");

        const test = tests[testNames[i]];

        // We capture the output of the test
        output[testNames[i]] = "";

        var success;
        try {
            success = await test();
        } catch (e) {
            success = false;
            failed[testNames[i]] = e;
        }

        if (success) {
            console.log(`%c passed`, "color: green;");
            results += ".";
        } else {
            console.log(`%c failed`, "color: red;");
            results += "F";
            numFailed++;
            if (!(testNames[i] in failed)) {
                failed[testNames[i]] = false;
            }   
        }
        // Cleanup the test, reset the console log
        await runCleanup();
    }

    // Print the result string
    console.log(`%c${results}`, "color: orange;");

    if (numFailed !== 0) {
        const failedNames = Object.keys(failed);
        console.log(`%c${failedNames.length} tests failed`, "color: red;");
        for (let i = 0; i < failedNames.length; i++) {
            const name = failedNames[i];
            console.log(`%cFailed ${name}, output and error:`, "color: red;");
            console.log(`${output[name]}`);
            console.log(`${failed[name]}`);
        }

    } else {
        console.log(`%cAll tests passed`, "color: green;");
    }
    return results;
}


export async function runAllTests() {
    const testSuiteNames = Object.keys(testSuites);

    await runCleanup();

    console.log(`%cRunning ${testSuiteNames.length} test suites:\n`, "color: orange;");

    let results = "";
    for (let i = 0; i < testSuiteNames.length; i++) {
        results += await runTestSuite(testSuiteNames[i]);
    }
    console.log(`%cAll tests ${results}`, "color: orange;");
}