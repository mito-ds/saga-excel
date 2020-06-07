const express = require('express');
const logger = require('morgan');
const app = express();

/* global process, require */

// Log all our routes
app.use(logger("short"));


// Add headers to make excel happy
app.use(function(req, res, next) {
    // TODO: figure out if we need this
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Serve all the assets for the add-in
app.use(express.static('dist'));

app.get("/project/:id", (req, res) => {
    res.redirect("https://sagacollab.com/instructions");
});

app.listen((process.env.PORT || 3000), () => {console.log(`Server is running on ${process.env.PORT || 3000}`);});