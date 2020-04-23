require('dotenv').config();
require('./src/models/ProjectSchema');
require('./src/models/EmailSchema');
require('./src/models/FeedbackSchema');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const app = express();
const projectRouter = require('./src/routers/project');
const mongoose = require('mongoose');
const Emails = mongoose.model("Emails");
const Feedback = mongoose.model("Feedback");

/* global process, require */

// Log all our routes
app.use(logger("short"));

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
async function getEmail(email) {
    return await Emails.findOne({email: email}).exec();
}

async function emailExists(email) {
    return (await getEmail(email)) !== null;
}

function createDateString () {
    const d = new Date();
    var dateString = '';
    dateString += d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear()
    dateString += ' ' + d.getHours() + ':' + d.getMinutes()
    return dateString
}

app.post('/submit-feedback', (req, res) => {
    const email = req.body.email;
    const relevance = req.body.relevance; 
    const response = req.body.response;

    const feedback = new Feedback();
    feedback.email = email
    feedback.relevance = relevance;
    feedback.response = response;
    feedback.date = createDateString();
    feedback.save();

    // Send Success Message
    res.end();
})

app.use('/postemail', async function (req, res) {
    const newEmail = req.body.email;
    const exists = await emailExists(newEmail);
    if (newEmail && !exists) {
        // TODO: don't save duplicates
        const email = new Emails();
        email.email = newEmail;
        await email.save();
    }
    res.status(200).end()
});


// Add the projects API
app.use('/project', projectRouter);

// Serve all the assets for the add-in
app.use(express.static('dist'))

app.listen((process.env.PORT || 3000), () => {console.log(`Server is running on ${process.env.PORT || 3000}`)});
