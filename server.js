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

files = {}

app.get('/', function (req, res) {
    res.json({"key": "value"});
});

app.post('/create', async function (req, res) {
    const fileContents = base64js.fromByteArray(req.body.fileContents);
    const id = uuidv4();
    console.log(`saving at ${id}`);
    files[id] = fileContents;
    res.json({"id": id});
});

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
    const id = base64js.fromByteArray(req.body.id);
    files[id] = fileContents;
    res.json({"id": id});
    res.end(200);
    console.log(req.params.id);
})


app.listen(3000);