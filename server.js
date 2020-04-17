require('dotenv').config();
require('./src/models/ProjectSchema');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const projectRouter = require('./src/routers/project');
const mongoose = require('mongoose');

/* global process, require */

// Load the project module

// Connect to mongo
mongoose.connect(
    process.env.MONGO_URL, 
    {useNewUrlParser: true, useUnifiedTopology: true}
);
if (process.env.NODE_ENV === 'production') {
    mongoose.set('debug', false);
}

// Add headers to make excel happy
app.use(function(req, res, next) {
    // TODO: figure out if we need this
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.use('/', (req, res) => {
    res.redirect("https://sagalab.org");
});


// Add the projects API
app.use('/project', projectRouter);

// Serve all the assets for the add-in
app.use(express.static('dist'))

app.listen((process.env.PORT || 3000), () => {console.log(`Server is running on ${process.env.PORT || 3000}`)});
