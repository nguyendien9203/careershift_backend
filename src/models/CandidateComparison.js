const mongoose = require("mongoose");
 
 const candidateComparisonSchema = new mongoose.Schema(
   {
     jobId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Job",
       required: [true, "Job ID is required"],
     },
     candidates: [
       {
         candidateId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Candidate",
           required: [true, "Candidate ID is required"],
         },
         averageScore: {
           type: Number,
           min: [0, "Average score must be at least 0"],
           max: [10, "Average score cannot exceed 10"],
         },
       },
     ],
     selectedCandidateId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Candidate",
       validate: {
         validator: function (v) {
           return !v || this.candidates.some((c) => c.candidateId.equals(v));
         },
         message: "Selected candidate must be from the listed candidates",
       },
     },
     status: {
       type: String,
       enum: {
         values: ["PENDING", "COMPLETED"],
         message: "Status must be either 'PENDING' or 'COMPLETED'",
       },
       default: "PENDING",
     },
   },
   { timestamps: true }
 );
 
 module.exports = mongoose.model("CandidateComparison", candidateComparisonSchema);