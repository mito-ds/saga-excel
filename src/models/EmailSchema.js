const mongoose = require('mongoose');

/* global require */

// TODO: update project schema
const EmailSchema = new mongoose.Schema({
    email: String
});

mongoose.model('Emails', EmailSchema);