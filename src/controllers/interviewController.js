const Interview = require("../models/Interview");

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

module.exports = { getInterviews, getInterviewById };
