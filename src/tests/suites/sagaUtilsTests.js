import { strict as assert } from 'assert';
import { runCreateSaga } from "../../saga/create";
import { TEST_URL } from "../../constants";
import { sagaProjectExists, sagaProjectJSON } from "../../saga/sagaUtils";

export async function testSagaProjectExists() {

    const existsBeforeCreation = await sagaProjectExists();
    assert.ok(!existsBeforeCreation, "No saga project should exist");

    // First, we create the project
    await runCreateSaga(TEST_URL, "email");


    const existsAfterCreate = await sagaProjectExists();
    assert.ok(existsAfterCreate, "A saga project should have been created");

    return true;
}

export async function testGetSagaObject() {

    const beforeObj = await sagaProjectJSON();
    assert.deepEqual(beforeObj, {}, "No project should result in empty json");

    await runCreateSaga(TEST_URL, "email");

    const afterObj = await sagaProjectJSON();
    assert.deepEqual(afterObj, {"remoteURL": TEST_URL, "email": "email"}, "Project should fill in JSON json");

    return true;
}