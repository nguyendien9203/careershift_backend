const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    stages: [
      {
        round: { type: Number, required: true },
        interviewer_ids: [
          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ],
        type: {
          type: String,
          required: true,
          enum: ["Technical", "HR", "Managerial", "Other"],
        },
        status: {
          type: String,
          enum: ["Scheduled", "Passed", "Failed", "Rescheduled", "Cancelled"],
          default: "Scheduled",
        },
        evaluations: [
          {
            interviewer_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            }, // ID người đánh giá
            score: {
              type: Object,
              default: {},
            },
            comments: {
              type: String,
              default: "", // Bình luận
            },
          },
        ],
      },
    ],
    final_status: {
      type: String,
      enum: ["In Progress", "Passed", "Failed"],
      default: "In Progress",
    },
    date: { type: Date, required: true }, 
    time: { type: String, required: true }, 
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
    address: {
      type: String,
      default: "", // Địa chỉ phỏng vấn (nếu offline)
    },
    google_meet_link: {
      type: String,
      default: "", // Link Google Meet (nếu online)
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Interview", InterviewSchema);
