const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const User = require("../models/User"); // Import model User

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
  
      // Kiểm tra ID hợp lệ
      if (!mongoose.Types.ObjectId.isValid(candidate_id) || !mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }
  
      // Kiểm tra & xử lý `stages`
      let parsedStages;
      try {
        parsedStages = typeof stages === "string" ? JSON.parse(stages) : stages;
      } catch (error) {
        return res.status(400).json({ success: false, message: "Định dạng stages không hợp lệ" });
      }
  
      if (!Array.isArray(parsedStages)) {
        return res.status(400).json({ success: false, message: "Stages phải là một mảng object" });
      }
  
      // Kiểm tra từng stage
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
  
      
  
        // Thêm mảng `evaluations` rỗng cho từng stage
        stage.evaluations = [];
      }
  
      // Tạo tài liệu phỏng vấn mới
      const newInterview = new Interview({
        candidate_id,
        job_id,
        stages: parsedStages,
        final_status: "In Progress",
        date,
        time,
        mode,
        address: mode === "Offline" ? address : "", 
        google_meet_link: mode === "Online" ? google_meet_link : "", 
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
  



  // Update ket qua phong van tung vong
  const updateInterviewStage = async (req, res) => {
  try {
    const { interview_id, round, interviewer_id, score, comments, status } = req.body;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(interview_id) || !mongoose.Types.ObjectId.isValid(interviewer_id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    // Tìm lịch phỏng vấn
    const interview = await Interview.findById(interview_id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Lịch phỏng vấn không tồn tại" });
    }

    // Tìm đúng vòng phỏng vấn (stage)
    const stage = interview.stages.find((s) => s.round === round);
    if (!stage) {
      return res.status(404).json({ success: false, message: `Không tìm thấy vòng phỏng vấn ${round}` });
    }

    // Kiểm tra xem interviewer_id có trong danh sách `interviewer_ids` của vòng phỏng vấn không
    if (!stage.interviewer_ids.some(id => id.toString() === interviewer_id)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền đánh giá vòng phỏng vấn này",
      });
    }

    // Thêm hoặc cập nhật đánh giá (evaluations)
    let evaluationIndex = stage.evaluations.findIndex((e) => e.interviewer_id.toString() === interviewer_id);

    if (evaluationIndex > -1) {
      // Nếu đã có đánh giá từ interviewer này, cập nhật lại
      stage.evaluations[evaluationIndex].score = score;
      stage.evaluations[evaluationIndex].comments = comments;
    } else {
      // Nếu chưa có, thêm mới
      stage.evaluations.push({ interviewer_id, score, comments });
    }

    // Nếu có trạng thái mới, cập nhật trạng thái vòng phỏng vấn
    if (status && ["Scheduled", "Passed", "Failed", "Rescheduled", "Cancelled"].includes(status)) {
      stage.status = status;
    }

    // Lưu cập nhật vào database
    await interview.save();

    res.status(200).json({
      success: true,
      message: `Cập nhật kết quả vòng ${round} thành công`,
      interview,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật vòng phỏng vấn:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};
  
  
module.exports = { getInterviews, getInterviewById,createInterview,updateInterviewStage };
