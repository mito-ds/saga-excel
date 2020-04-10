const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const base64js = require('base64-js');
const { v4: uuidv4 } = require('uuid');

const BRANCH_STATE_HEAD = 0;
const BRANCH_STATE_AHEAD = 1;
const BRANCH_STATE_BEHIND = 2;
const BRANCH_STATE_FORKED = 3;

// Add headers to make excel happy
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

projects = {}

app.get('/', function (req, res) {
    const urls = Object.keys(projects).map(id => `https://excel.sagalab.org/project/${id}`);
    res.json(Object.keys(projects));
});

function createProject(id) {
    if (id in projects) {
        console.error(`Error: a project already exists with id: ${id}`)
        return false;
    }

    projects[id] = {};
    projects[id].contents = {};
    projects[id].parent = {};
    projects[id].child = {};
    projects[id].commitSheets = {};
    projects[id].headCommitID = "";

    return true;
}

const getBranchState = (id, headCommitID, parentCommitID) => {

    const project = projects[id];

    if (headCommitID === project.headCommitID) {
        return BRANCH_STATE_HEAD;
    } else if (parentCommitID === project.headCommitID) {
        return BRANCH_STATE_AHEAD;
    } else if (headCommitID in project.child) {
        return BRANCH_STATE_BEHIND;
    } else {
        return BRANCH_STATE_FORKED;
    }
}

app.post('/create', async function (req, res) {
    const id = uuidv4();

    if (createProject(id)) {
        console.log(projects);
        res.json({"id": id});
    } else {
        res.json({"id": ""});
    }
});

app.get('/project/:id/checkhead', async function (req, res) {
    console.log(req.originalUrl)

    const id = req.params.id;

    console.log(`checking head at ${id}`);

    if (!(id in projects)) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.query.headCommitID;
    const parentCommitID = req.query.parentCommitID;
    const branchState = getBranchState(id, headCommitID, parentCommitID);
    res.json({branch_state: branchState});
})


const updateProject = (id, headCommitID, parentCommitID, fileContents, commitSheets) => {

    const branchState = getBranchState(id, headCommitID, parentCommitID);
    if (branchState !== BRANCH_STATE_AHEAD) {
        return false;
    }

    projects[id].parent[headCommitID] = parentCommitID;
    projects[id].child[parentCommitID] = headCommitID;

    projects[id].contents[headCommitID] = fileContents;
    projects[id].commitSheets[headCommitID] = commitSheets;
    projects[id].headCommitID = headCommitID;

    return true;
}

app.get('/project/:id/summary', async function (req, res) {
    const id = req.params.id;
    console.log(`getting update for ${id}`);

    if (!(id in projects)) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }
    res.json(projects[id]).end();
})

app.get('/project/:id', async function (req, res) {
    const id = req.params.id;
    console.log(`getting update for ${id}`);

    if (!(id in projects)) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.query.headCommitID;
    const parentCommitID = req.query.parentCommitID;

    const branchState = getBranchState(id, headCommitID, parentCommitID);
    const project = projects[id];
    const fileContents = project.contents[project.headCommitID];

    // If the branch state is behind, we report everything you need to catch up
    if (branchState === BRANCH_STATE_BEHIND) {
        var currCommitID = project.child[headCommitID];
        var commitIDs = [];
        var commitSheets = [];
        while (currCommitID !== undefined) {
            commitIDs.push(currCommitID);
            project.commitSheets[currCommitID].forEach(commitSheet => {
                commitSheets.push(commitSheet);
            })
            currCommitID = project.child[currCommitID];
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
app.post('/project/:id', async function (req, res) {

    const id = req.params.id;
    console.log(`updating a project at ${id}`);

    if (!(id in projects)) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.body.headCommitID;
    const parentCommitID = req.body.parentCommitID;
    const fileContents = req.body.fileContents;
    const commitSheets = req.body.commitSheets;

    const updatedProject = updateProject(
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


app.listen(3000);
