const CandidateComparisonSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidates: [
      {
        candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
        average_score: Number
      }
    ],
    selected_candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('CandidateComparison', CandidateComparisonSchema);
  