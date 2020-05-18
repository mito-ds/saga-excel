import log from "loglevel";
import * as tests from "./testFile";
import defaultTest from "./testFile";
import { runCleanup } from "../saga/cleanup";

export async function runTests() {

    // To run one test at once, export it as default
    if (defaultTest) {
        try {
            const result = await defaultTest();
            log.info(`default test: ${result}`);
        } catch (e) {
            log.info(`default test: false`);
            console.log(e)
        }
        await runCleanup();
        return;
    }

    const testNames = Object.keys(tests);

    log.info(`Make sure you run these tests from an empty workbook. Running ${testNames.length} tests:`);

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
    log.info(results);

    if (numFailed !== 0) {
        const failedNames = Object.keys(failed);
        log.error(`You failed some tests: ${failedNames}`);
        for (let i = 0; i < failedNames.length; i++) {
            const name = failedNames[i];
            log.error(`Failed ${name}:`);
            log.error(`${failed[name]}`);
        }

    } else {
        log.info(`All tests passed!`);
    }
}