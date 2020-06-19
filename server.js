const express = require('express');
const logger = require('morgan');
const app = express();
const path = require('path');
var https = require('https');
const devCerts = require("office-addin-dev-certs");


/* global process, require, __dirname */

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
app.use(express.static(path.join(__dirname, 'dist')));

app.use("/difference", express.static(path.join(__dirname, 'dist_difference')));

app.get("/project/:id", (req, res) => {
    res.redirect("https://sagacollab.com/instructions");
});


app.listen((process.env.PORT || 3000), () => {console.log(`Server is running on ${process.env.PORT || 3000}`);});
/*
(async () => {
    const certs = await devCerts.getHttpsServerOptions();
    https.createServer(certs, app).listen(3000, function () {
        console.log('Saga app listening on port 3000! Go to https://localhost:3000/');
    });
  
})(); */