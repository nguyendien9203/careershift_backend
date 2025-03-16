const mongoose = require("mongoose");

const candidateComparisonSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    selectedCandidateId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        validate: {
          validator: function (v) {
            return !v || this.candidates.some((c) => c.candidateId.equals(v));
          },
          message: "Selected candidate must be from the listed candidates",
        },
      }
    ],
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

module.exports = mongoose.model(
  "CandidateComparison",
  candidateComparisonSchema
);
