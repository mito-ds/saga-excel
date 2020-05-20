import * as tests from "./testFile";
import { runCleanup } from "../saga/cleanup";

export async function runTests() {
    // First, we cleanup everything
    await runCleanup();

    const testNames = Object.keys(tests);

    console.log(`Make sure you run these tests from an empty workbook`);
    console.log(`Running ${testNames.length} tests:\n`);

    var results = "";
    var numFailed = 0;
    var failed = {};
    for (let i = 0; i < testNames.length; i++) {
        const test = tests[testNames[i]];

        var success;
        try {
            success = await test();
        } catch (e) {
            success = false;
            failed[testNames[i]] = e;
        }

        if (success) {
            results += "."
        } else {
            results += "F"
            numFailed++;
            if (!(testNames[i] in failed)) {
                failed[testNames[i]] = false;
            }   
        }
        await runCleanup();
    }
    console.log(results);

    if (numFailed !== 0) {
        const failedNames = Object.keys(failed);
        console.log(`You failed some tests: ${failedNames}`);
        for (let i = 0; i < failedNames.length; i++) {
            const name = failedNames[i];
            console.log(`Failed ${name}:`);
            console.log(`${failed[name]}`);
        }

    } else {
        console.log(`All tests passed!`);
    }
}