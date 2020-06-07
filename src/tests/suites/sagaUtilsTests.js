import { strict as assert } from 'assert';
import { runOperation } from "../../saga/runOperation";
import { runCreateSaga } from "../../saga/create";
import { runCommit } from "../../saga/commit";
import { TEST_URL } from "../../constants";
import Project from "../../saga/Project";
import { sagaProjectExists, sagaProjectJSON, getFirstAncestorOnMaster } from "../../saga/sagaUtils";

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

export async function testGetAncestorOnMasterNoHop() {
    await runCreateSaga(TEST_URL, "email");
    const masterHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("master");
    })).operationResult;
    const personalHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("email");
    })).operationResult;

    const commitID = (await runOperation(getFirstAncestorOnMaster, masterHead, personalHead)).operationResult;

    assert.equal(commitID, masterHead);

    return true;
}

export async function testGetAncestorOnMasterOneHop() {
    await runCreateSaga(TEST_URL, "email");
    // Make a commit on personal branch
    await runCommit("", "", "email");

    const masterHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("master");
    })).operationResult;
    const personalHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("email");
    })).operationResult;

    const commitID = (await runOperation(getFirstAncestorOnMaster, masterHead, personalHead)).operationResult;

    assert.equal(commitID, masterHead);

    return true;
}

export async function testGetAncestorOnMasterDivergeOne() {
    await runCreateSaga(TEST_URL, "email");
    // Make a commit on personal branch
    await runCommit("", "", "email");
    // And make a commit on master
    await runCommit("", "", "master");

    const masterHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("master");
    })).operationResult;
    const personalHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("email");
    })).operationResult;

    const commitID = (await runOperation(getFirstAncestorOnMaster, masterHead, personalHead)).operationResult;

    const masterParent = (await runOperation(async (context) => {
        return await (new Project(context)).getParentCommitID(masterHead);
    })).operationResult;
    assert.equal(commitID, masterParent);

    return true;
}

export async function testGetAncestorOnMasterDivergeMany() {
    await runCreateSaga(TEST_URL, "email");
    // Make a few commits on personal branch
    await runCommit("", "", "email");
    await runCommit("", "", "email");
    await runCommit("", "", "email");
    // And make a commit on master
    await runCommit("", "", "master");
    await runCommit("", "", "master");
    await runCommit("", "", "master");


    const masterHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("master");
    })).operationResult;
    const personalHead = (await runOperation(async (context) => {
        return await (new Project(context)).getCommitIDFromBranch("email");
    })).operationResult;
    const commitID = (await runOperation(getFirstAncestorOnMaster, masterHead, personalHead)).operationResult;

    const lcsCommit = (await runOperation(async (context) => {
        const project = new Project(context);
        let parent = await project.getParentCommitID(masterHead);
        parent = await project.getParentCommitID(parent);
        parent = await project.getParentCommitID(parent);
        return parent;
    })).operationResult;
    assert.equal(commitID, lcsCommit);

    return true;
}