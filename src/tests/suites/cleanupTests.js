import assert from "assert";
import { runCreateSaga } from "../../saga/create";
import { runCleanup } from "../../saga/cleanup";
import { runOperation } from "../../saga/runOperation";
import { TEST_URL } from "../../constants";
import { getSheetsWithNames } from "../../saga/sagaUtils";


export async function testCleanup() {
    
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we cleanup the project
    await runCleanup();

    // Then, we make sure there is only a single sheet
    const result = await runOperation(getSheetsWithNames);
    const sheets = result.operationResult;
    assert.equal(sheets.length, 1, "Should have created 3 sheets");

    return true;
}
  