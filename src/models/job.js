const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    platform: {
        type: [String],
        required: true,
    },
    source_url: {
        type: String,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    updated_by: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});