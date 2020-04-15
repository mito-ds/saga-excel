const project = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const mongoose = require(`mongoose`);
const Projects = mongoose.model('Projects');

/* global require, module */

const BRANCH_STATE_HEAD = 0;
const BRANCH_STATE_AHEAD = 1;
const BRANCH_STATE_BEHIND = 2;
const BRANCH_STATE_FORKED = 3;

var projects = {}

async function getProject(id) {
    return await Projects.findOne({id: id}).exec();
}

async function projectExists(id) {
    return (await getProject(id)) !== null;
}

async function createProject(id) {

    const exists = await projectExists(id);

    if (exists) {
        console.error(`Error: a project already exists with id ${id}`);
        return false;
    }

    const project = new Projects();
    project.id = id;
    project.headCommitID = "";
    project.contents = {}
    project.parent = {};
    project.child = {};
    project.contents = {};
    project.commitSheets = {};

    await project.save();
    return true;
}

const getBranchState = async (id, headCommitID, parentCommitID) => {

    const project = await getProject(id);

    if (headCommitID === project.headCommitID) {
        return BRANCH_STATE_HEAD;
    } else if (parentCommitID === project.headCommitID) {
        return BRANCH_STATE_AHEAD;
    } else if (project.child.get(headCommitID)) {
        return BRANCH_STATE_BEHIND;
    } else {
        return BRANCH_STATE_FORKED;
    }
}

project.post('/create', async function (req, res) {
    const id = uuidv4();
    const created = await createProject(id);

    if (created) {
        console.log(projects);
        res.json({"id": id});
    } else {
        res.json({"id": ""});
    }
});

project.get('/:id/checkhead', async function (req, res) {

    const id = req.params.id;
    const exists = await projectExists(id);

    if (!exists) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.query.headCommitID;
    const parentCommitID = req.query.parentCommitID;
    const branchState = await getBranchState(id, headCommitID, parentCommitID);
    res.json({branch_state: branchState});
})


const updateProject = async (id, headCommitID, parentCommitID, fileContents, commitSheets) => {

    const branchState = await getBranchState(id, headCommitID, parentCommitID);
    if (branchState !== BRANCH_STATE_AHEAD) {
        return false;
    }

    const project = await getProject(id);

    project.parent.set(headCommitID, parentCommitID);
    project.child.set(parentCommitID, headCommitID);
    project.contents.set(headCommitID, fileContents);
    project.commitSheets.set(headCommitID, commitSheets);
    project.headCommitID = headCommitID;

    await project.save();

    return true;
}

project.get('/:id/summary', async function (req, res) {
    const id = req.params.id;
    const exists = await projectExists(id);

    if (!exists) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }
    const project = await getProject(id);
    res.json(project).end();
})

project.get('/:id', async function (req, res) {
    const id = req.params.id;
    const exists = await projectExists(id);

    if (!exists) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.query.headCommitID;
    const parentCommitID = req.query.parentCommitID;

    const branchState = await getBranchState(id, headCommitID, parentCommitID);
    const project = await getProject(id);
    const fileContents = project.contents.get(project.headCommitID);

    // If the branch state is behind, we report everything you need to catch up
    if (branchState === BRANCH_STATE_BEHIND) {
        var currCommitID = project.child.get(headCommitID);
        var commitIDs = [];
        var commitSheets = [];
        while (currCommitID !== undefined) {
            commitIDs.push(currCommitID);
            project.commitSheets.get(currCommitID).forEach(commitSheet => {
                commitSheets.push(commitSheet);
            })
            currCommitID = project.child.get(currCommitID);
        }

        res.json({
            branchState: branchState,
            fileContents: fileContents,
            commitIDs: commitIDs,
            commitSheets: commitSheets
        }).end();
    } else {
        res.json({
            branchState: branchState,
            fileContents: fileContents
        }).end();
    }
})


// Route to post an update to a project
project.post('/:id', async function (req, res) {

    const id = req.params.id;
    const exists = await projectExists(id);

    if (!exists) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.body.headCommitID;
    const parentCommitID = req.body.parentCommitID;
    const fileContents = req.body.fileContents;
    const commitSheets = req.body.commitSheets;

    const updatedProject = await updateProject(
        id, 
        headCommitID, 
        parentCommitID, 
        fileContents, 
        commitSheets
    );

    // 409 is a conflict, which we have if the project can't be updated!
    res.status(updatedProject ? 200 : 409).end();

    console.log(`updated project ${updatedProject} : ${id} : ${fileContents}`);
})

module.exports = project;