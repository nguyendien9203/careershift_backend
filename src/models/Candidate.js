
const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    cv_url: String,
    source: String,
    status: { type: String, enum: ['Available', 'Hired', 'Rejected'], default: 'Available' },
    is_potential: Boolean,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Candidate', CandidateSchema);