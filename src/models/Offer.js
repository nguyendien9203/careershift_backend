const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruitment', required: true },
    base_salary: Number,
    negotiated_salary: Number,
    approval_required: Boolean,
    salary: Number,
    status: { type: String, enum: ['Sent', 'Accepted', 'Rejected'], default: 'Sent' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Offer', OfferSchema);
  