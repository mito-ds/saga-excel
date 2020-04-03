const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const base64js = require('base64-js');
const uuid = require('uuid');

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
    const id = uuid();
    console.log(`saving at ${id}`);
    files[id] = fileContents
    res.json({"key": "id"});
});

app.listen(3000);