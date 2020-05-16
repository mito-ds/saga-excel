const mongoose = require('mongoose');

/* global require */

const EmailSchema = new mongoose.Schema({
    email: String
});


mongoose.model('Emails', EmailSchema);