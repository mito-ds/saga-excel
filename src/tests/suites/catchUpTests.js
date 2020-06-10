import { strict as assert } from 'assert';
import { runCreateSaga, runReplaceFromBase64 } from "../../saga/create";
import { runOperation } from "../../saga/runOperation";
import { TEST_URL } from "../../constants";
import { getGlobal } from "../../utils";
import * as scenarios from "../scenarios";
import Project from "../../saga/Project";


export async function testGetSetLastCatchUp() {

    // First, we create the project
    await runCreateSaga(TEST_URL, "email");

    // Then, we check that the last catch up is the first commit.
    let originalLastCatchUp;
    let masterCommit;
    let newLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        originalLastCatchUp = await project.getLastCatchUpCommitID();
        masterCommit = await project.getCommitIDFromBranch("master")
        
        // And we try and update it
        await project.setLastCatchUpCommitID("secondcommit")
        newLastCatchUp = await project.getLastCatchUpCommitID();

    });

    assert.equal(originalLastCatchUp, masterCommit);
    assert.equal(newLastCatchUp, "secondcommit");
    return true;
}

export async function testResetPersonalChangesLastCaughtUp() {

    // Load scenario
    const fileContents = scenarios["unmergedNoConflict"].fileContents;
    await runReplaceFromBase64(fileContents);


    // Then, we check that the last catch up is the first commit.
    let originalLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        originalLastCatchUp = await project.getLastCatchUpCommitID();
    });
    assert.equal(originalLastCatchUp, "firstcommit");

    const g = getGlobal();
    await g.resetPersonalVersion();

    // Then, we check that the last catch up is the first commit.
    let masterHeadCommitID;
    let newLastCatchUp;
    await runOperation(async (context) => {
        const project = new Project(context);
        masterHeadCommitID = await project.getCommitIDFromBranch("master");
        newLastCatchUp = await project.getLastCatchUpCommitID();
    });
    assert.equal(masterHeadCommitID, newLastCatchUp)

    return true;
}

