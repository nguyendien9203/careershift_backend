
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: String,
    platform: String,
    source_url: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Job', JobSchema);
  