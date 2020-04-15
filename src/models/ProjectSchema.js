const mongoose = require('mongoose');

/* global require */

// TODO: update project schema
const ProjectsSchema = new mongoose.Schema({
    id: String,
    headCommitID: String,
    contents: {
        type: Map,
        of: String
    },
    parent: {
        type: Map,
        of: String
    },
    child: {
        type: Map,
        of: String
    },
    commitSheets: {
        type: Map,
        of: [String]
    }
});


mongoose.model('Projects', ProjectsSchema);