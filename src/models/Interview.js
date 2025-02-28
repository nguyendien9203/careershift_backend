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
        round: { type: Number, required: true }, // Vòng phỏng vấn
        interviewer_ids: [
          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ], // Người phỏng vấn
        type: {
          type: String,
          required: true,
          enum: ["Technical", "HR", "Managerial", "Other"], // Loại phỏng vấn
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
              default: {}, // Điểm đánh giá (có thể mở rộng)
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
    date: { type: Date, required: true }, // Ngày phỏng vấn
    time: { type: String, required: true }, // Thời gian phỏng vấn
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
  { timestamps: true } // Tự động thêm `createdAt` và `updatedAt`
);

module.exports = mongoose.model("Interview", InterviewSchema);
