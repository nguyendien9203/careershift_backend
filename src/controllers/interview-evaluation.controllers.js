const Interview = require("../models/interview.model");
const User = require("../models/user.model");
const Recruitment = require("../models/recruitment.model");
const mongoose = require("mongoose");

// Xem đánh giá của một người phỏng vấn trong một phỏng vấn
const viewEvaluations = async (req, res) => {
  try {
    const { interviewId, interviewerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(interviewId) ||
      !mongoose.Types.ObjectId.isValid(interviewerId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });

    const evaluations = interview.stages
      .flatMap((stage) => stage.evaluations)
      .filter((e) => e.interviewerId.equals(interviewerId));

    res.status(200).json({ success: true, data: evaluations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Tổng hợp đánh giá của tất cả các ứng viên
const getEvaluationSummary = async (req, res) => {
  try {
    // Lấy tất cả các recruitment
    const recruitments = await Recruitment.find()
      .populate("candidateId", "name") // Lấy tên ứng viên
      .populate("jobJd", "title"); // Lấy tiêu đề công việc, có thể null

    if (!recruitments || recruitments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No recruitments found" });
    }

    // Lấy tất cả các interview liên quan đến các recruitment
    const recruitmentIds = recruitments.map((r) => r._id);
    const interviews = await Interview.find({
      recruitmentId: { $in: recruitmentIds },
    }).populate("stages.evaluations.interviewerId", "name"); // Lấy tên người phỏng vấn

    if (!interviews || interviews.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No interviews found" });
    }

    // Tổng hợp dữ liệu theo ứng viên
    const summary = recruitments.map((recruitment) => {
      const candidateInterviews = interviews.filter(
        (interview) =>
          interview.recruitmentId.toString() === recruitment._id.toString()
      );

      const evaluations = candidateInterviews.flatMap((interview) =>
        interview.stages.flatMap((stage) =>
          stage.evaluations.map((evaluation) => ({
            score: evaluation.score,
            comments: evaluation.comments || "N/A",
            interviewer: evaluation.interviewerId
              ? evaluation.interviewerId.name
              : "Unknown",
          }))
        )
      );

      return {
        candidateName: recruitment.candidateId
          ? recruitment.candidateId.name
          : "Unknown Candidate",
        jobTitle:
          recruitment.jobJd && recruitment.jobJd.title
            ? recruitment.jobJd.title
            : "Unknown Job",
        evaluations:
          evaluations.length > 0 ? evaluations : "No evaluations yet",
      };
    });

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("Error fetching evaluation summary:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//update pass/fail từng vòng phỏng vấn
const updatePassFail = async (req, res) => {
  try {
    const { interviewId, round, status } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!interviewId || !round || !status) {
      return res.status(400).json({
        success: false,
        message: "interviewId, round và status là bắt buộc",
      });
    }

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "ID phỏng vấn không hợp lệ",
      });
    }

    // Kiểm tra số vòng
    if (typeof round !== "number" || round < 1) {
      return res.status(400).json({
        success: false,
        message: "Số vòng không hợp lệ",
      });
    }

    // Kiểm tra trạng thái
    if (!["PASSED", "FAILED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái phải là 'PASSED' hoặc 'FAILED'",
      });
    }

    // Cập nhật chỉ trạng thái của vòng bằng updateOne
    const updateResult = await Interview.updateOne(
      { _id: interviewId, "stages.round": round },
      {
        $set: {
          "stages.$.status": status, // Chỉ cập nhật status của vòng
          updatedBy: req.user?._id,  // Cập nhật người sửa
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phỏng vấn hoặc vòng để cập nhật",
      });
    }

    // Lấy tài liệu đã cập nhật để trả về
    const updatedInterview = await Interview.findById(interviewId);

    return res.status(200).json({
      success: true,
      message: `Cập nhật vòng ${round} thành ${status} thành công`,
      data: updatedInterview,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái pass/fail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật trạng thái pass/fail",
      error: error.message,
    });
  }
};
module.exports = { viewEvaluations, getEvaluationSummary, updatePassFail };
