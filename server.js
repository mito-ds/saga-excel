require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const projectRouter = require('./src/routers/project');

// Add headers to make excel happy
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

// Add the projects API
app.use('/project', projectRouter);

// Serve all the assets for the add-in
app.use(express.static('dist'))

app.listen(3000);
