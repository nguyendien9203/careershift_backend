const mongoose = require("mongoose");

const recruitmentSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: [true, "Candidate ID is required"],
    },
    jobId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["ON_PROGRESS", "INTERVIEW", "REJECTED", "HIRED"],
        message:
          "Status must be one of: ON_PROGRESS, INTERVIEW, REJECTED, HIRED",
      },
      default: "ON_PROGRESS",
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruitment", recruitmentSchema);