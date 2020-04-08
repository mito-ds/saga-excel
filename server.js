const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const base64js = require('base64-js');
const { v4: uuidv4 } = require('uuid');

// Add headers to make excel happy
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

projects = {}

app.get('/', function (req, res) {
    res.json({"key": "value"});
});

function createProject(id, fileContents) {
    if (id in projects) {
        console.error(`Error: a project already exists with id: ${id}`)
        return false;
    }

    projects[id] = {};
    projects[id].contents = {};
    projects[id].parent = {};
    projects[id].child = {};
    projects[id].headCommitID = "";

    return true;
}

app.post('/create', async function (req, res) {
    const id = uuidv4();
    console.log(`Creating a project a ${id}`);

    const fileContents = base64js.fromByteArray(req.body.fileContents);

    if (createProject(id, fileContents)) {
        console.log(projects);
        res.json({"id": id});
    } else {
        res.json({"id": ""});
    }
});

// Route to post an update to a project
app.get('/checkhead/:id', async function (req, res) {

    const id = req.body.id;

    if (!(id in projects)) {
        res.status(404).end(); // If the project does not exist, we say so
        return;
    }

    const headCommitID = req.body.headCommitID;
    const parentCommitID = req.body.parentCommitID;

    const BRANCH_STATE_HEAD = 0;
    const BRANCH_STATE_AHEAD = 1;
    const BRANCH_STATE_BEHIND = 2;
    const BRANCH_STATE_FORKED = 3;

    const project = projects[id];

    if (headCommitID == project.headCommitID) {
        res.json({branch_state: BRANCH_STATE_HEAD});
    } else if (parentCommitID == project.headCommitID) {
        res.json({branch_state: BRANCH_STATE_AHEAD});
    } else if (headCommitID in project.child) {
        res.json({branch_state: BRANCH_STATE_BEHIND});
    } else {
        res.json({branch_state: BRANCH_STATE_FORKED});
    }
})

app.get('/project/:id', async function (req, res) {
    // TODO: we should also send back a filename?
    res.json(
        {
            "fileContents": files[req.params.id]
        }
    )

    console.log(req.params.id);
})

// Route to post an update to a project
app.post('/project/:id', async function (req, res) {
    const fileContents = base64js.fromByteArray(req.body.fileContents);
    const id = req.body.id;
    console.log(`updating at ${id}`);

    files[id] = fileContents;
    res.json({"id": id});
    res.end(200);
    console.log(req.params.id);
})


app.listen(3000);
