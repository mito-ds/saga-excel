import * as tests from "./testFile";
import defaultTest from "./testFile";
import { runCleanup } from "../saga/cleanup";

export async function runTests() {

    // To run one test at once, export it as default
    if (defaultTest) {
        try {
            await defaultTest();
            console.log("ran default test")
        } catch (e) {
            console.log(e)
        }
        await runCleanup();
        return;
    }

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
    await runCleanup();
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