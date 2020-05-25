import { strict as assert } from 'assert';
import { runOperation } from "../../saga/runOperation";
import { runCreateSaga } from "../../saga/create";
import { runCommit } from "../../saga/commit";
import { TEST_URL } from "../../constants";
import Project from "../../saga/Project";

export async function testSetRemoteURL() {
    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    let newURL;
    await runOperation(async (context) => {
        const project = new Project(context);
        await project.setRemoteURL(TEST_URL + "NEW");
        newURL = await project.getRemoteURL();
    });

    assert.equal(TEST_URL + "NEW", newURL);

    return true;
}