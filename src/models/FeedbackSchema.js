const mongoose = require('mongoose');

/* global require */

const FeedbackSchema = new mongoose.Schema({
    email: String,
    relevance: String,
    response: String,
    date: String
});

mongoose.model('Feedback', FeedbackSchema);