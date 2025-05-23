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
    cvFile: {
      fileName: {
        type: String,
        required: [true, "CV file name is required"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      required: [true, "CV file is required"],
      type: Object,
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
