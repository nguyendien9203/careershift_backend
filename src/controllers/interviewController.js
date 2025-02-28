const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const mongoose = require("mongoose");
// Lấy danh sách lịch phỏng vấn (Get ALL)
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

// Lấy một lịch phỏng vấn theo ID
const getInterviewById = async (req, res) => {
    try {
      const interview = await Interview.findById(req.params.id)
        .populate("candidate_id", "name email phone")
        .populate("job_id", "title platform")
        .populate("stages.interviewer_ids", "name email");
  
      if (!interview) {
        return res.status(404).json({ success: false, message: "Không tìm thấy lịch phỏng vấn" });
      }
  
      res.json({ success: true, interview });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server", error });
    }
  };





  
  const createInterview = async (req, res) => {
    try {
      const { candidate_id, job_id, stages, date, time, mode, address, google_meet_link } = req.body;
  
      // 🛑 Kiểm tra ID hợp lệ
      if (!mongoose.Types.ObjectId.isValid(candidate_id) || !mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }
  
      // 🛑 Kiểm tra ứng viên & công việc có tồn tại không
      const [candidateExists, jobExists] = await Promise.all([
        Candidate.findById(candidate_id),
        Job.findById(job_id),
      ]);
  
      if (!candidateExists || !jobExists) {
        return res.status(404).json({ success: false, message: "Ứng viên hoặc công việc không tồn tại" });
      }
  
      // 🛑 Kiểm tra & xử lý `stages` (đảm bảo là mảng object)
      let parsedStages;
      try {
        parsedStages = typeof stages === "string" ? JSON.parse(stages) : stages;
      } catch (error) {
        return res.status(400).json({ success: false, message: "Định dạng stages không hợp lệ" });
      }
  
      if (!Array.isArray(parsedStages)) {
        return res.status(400).json({ success: false, message: "Stages phải là một mảng object" });
      }
  
      // 🛑 Kiểm tra từng stage có đủ dữ liệu không
      for (let stage of parsedStages) {
        if (!stage.round || !stage.type || !stage.status || !Array.isArray(stage.interviewer_ids)) {
          return res.status(400).json({
            success: false,
            message: "Mỗi stage cần có round, type, status và interviewer_ids là mảng",
          });
        }
  
        // Kiểm tra `interviewer_ids` có hợp lệ không
        for (let interviewer_id of stage.interviewer_ids) {
          if (!mongoose.Types.ObjectId.isValid(interviewer_id)) {
            return res.status(400).json({
              success: false,
              message: `ID của người phỏng vấn (${interviewer_id}) không hợp lệ`,
            });
          }
        }
      }
  
      // ✅ Tạo tài liệu phỏng vấn mới
      const newInterview = new Interview({
        candidate_id,
        job_id,
        stages: parsedStages,
        final_status: "In Progress",
        date,
        time,
        mode,
        address: mode === "Offline" ? address : "", // Chỉ lưu địa chỉ nếu Offline
        google_meet_link: mode === "Online" ? google_meet_link : "", // Chỉ lưu link nếu Online
      });
  
      await newInterview.save();
  
      res.status(201).json({
        success: true,
        message: "Tạo lịch phỏng vấn thành công",
        interview: newInterview,
      });
    } catch (error) {
      console.error("Lỗi khi tạo lịch phỏng vấn:", error);
      res.status(500).json({ success: false, message: "Lỗi server", error });
    }
  };

  
  
  
module.exports = { getInterviews, getInterviewById,createInterview };
