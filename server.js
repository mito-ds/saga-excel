const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const base64js = require('base64-js');
const fs = require('fs').promises;
const Office = require('office-js');

// Add headers to make excel happy
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.json({"key": "value"});
});

app.post('/file', async function (req, res) {
    const fileContents = base64js.fromByteArray(req.body.fileContents);
    await Office.Excel.createWorkbook(fileContents).catch(function (error) {
        console.error(error);
    });

    res.json({"key": "value"});
});

app.listen(3000);