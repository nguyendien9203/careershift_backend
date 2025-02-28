
const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    stages: [
      {
        round: Number,
        interviewer_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        type: String,
        status: { type: String, enum: ['Scheduled', 'Passed', 'Failed', 'Rescheduled', 'Cancelled'], default: 'Scheduled' },
        evaluations: [
          {
            interviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            score: Object,
            comments: String
          }
        ]
      }
    ],
    final_status: { type: String, enum: ['In Progress', 'Passed', 'Failed'], default: 'In Progress' },
    date: Date,
    time: String,
    mode: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
    address: String,
    google_meet_link: String
  }, { timestamps: true });
  
  module.exports = mongoose.model('Interview', InterviewSchema);