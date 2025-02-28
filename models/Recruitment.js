const RecruitmentSchema = new mongoose.Schema({
    candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    status: { type: String, enum: ['On Progress', 'Interview', 'Rejected', 'Hired'], default: 'On Progress' },
    notes: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Recruitment', RecruitmentSchema);
  