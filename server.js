require('dotenv').config();
require('./src/models/ProjectSchema');
require('./src/models/EmailSchema');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const projectRouter = require('./src/routers/project');
const mongoose = require('mongoose');
const Emails = mongoose.model('Emails');

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


//Route to save emails to mongo
app.use('/postemail', async function (req, res) {
    const newEmail = req.body.newEmail;
    console.log(`adding email: ${newEmail} to mongo databse` )
    const writeResult = await Emails.insertOne({email: newEmail}).exec();
    console.log(writeResult)
    res.status(200).end()
});



// Add the projects API
app.use('/project', projectRouter);

// Serve all the assets for the add-in
app.use(express.static('dist'))

app.listen((process.env.PORT || 3000), () => {console.log(`Server is running on ${process.env.PORT || 3000}`)});
