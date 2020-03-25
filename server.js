const express = require('express');
const path = require('path');
const app = express();

// Add headers to make excel happy
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', function (req, res) {
    res.json({"key": "value"});
});

app.post('/file', function (req, res) {
    res.json({"key": "value"});
});

app.listen(3000);