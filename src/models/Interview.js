const mongoose = require("mongoose");
const Recruiments = require("../models/Recruitment")
const evaluationSchema = new mongoose.Schema({
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Interviewer ID is required for evaluation"],
  },
  score: {
    type: Map,
    of: {
      type: Number,
      min: [0, "Score must be between 0 and 10"],
      max: [10, "Score must be between 0 and 10"],
    },
    validate: {
      validator: function (scores) {
        return Object.values(scores).every(
          (score) => score >= 0 && score <= 10
        );
      },
      message: "All scores must be between 0 and 10",
    },
  },
  comments: {
    type: String,
    trim: true,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    recruitmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruitment",
      required: [true, "Recruitment ID is required"],
    },
    stages: [
      {
        round: {
          type: Number,
          required: [true, "Round number is required"],
          min: [1, "Round number must be at least 1"],
        },
        interviewerIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "At least one interviewer is required"],
          },
        ],
        type: {
          type: String,
          required: [true, "Interview type is required"],
          enum: {
            values: ["HR_SCREENING", "TECHNICAL_INTERVIEW", "FINAL_INTERVIEW"],
            message: "Invalid interview type",
          },
        },
        status: {
          type: String,
          enum: {
            values: ["SCHEDULED", "PASSED", "FAILED", "PENDING"],
            message: "Invalid status value",
          },
          default: "SCHEDULED",
        },
        evaluations: [evaluationSchema],
      },
    ],
    finalStatus: {
      type: String,
      enum: {
        values: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
        message:
          "Final status must be either 'IN_PROGRESS', 'COMPLETED', or 'CANCELLED'",
      },
      default: "IN_PROGRESS",
    },
    date: {
      type: Date,
      required: [true, "Interview date is required"],
    },
    time: {
      type: String,
      required: [true, "Interview time is required"],
    },
    mode: {
      type: String,
      enum: {
        values: ["ONLINE", "OFFLINE"],
        message: "Mode must be either 'ONLINE' or 'OFFLINE'",
      },
      required: [true, "Interview mode is required"],
    },
    address: {
      type: String,
      trim: true,
    },
    google_meet_link: String,
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

module.exports = mongoose.model("Interview", interviewSchema);