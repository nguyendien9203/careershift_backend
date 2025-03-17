const Interview = require("../models/interview.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Chỉ định (thêm) người phỏng vấn vào một vòng, kiểm tra trùng thời gian
const assignInterviewers = async (req, res) => {
  try {
    const { interviewId, round, interviewerIds } = req.body;

    // Kiểm tra interviewId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview ID" });
    }

    // Tìm phỏng vấn hiện tại
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });

    // Tìm vòng phỏng vấn
    const stage = interview.stages.find((s) => s.round === round);
    if (!stage)
      return res
        .status(404)
        .json({ success: false, message: `Round ${round} not found` });

    // Kiểm tra interviewerIds hợp lệ
    const validInterviewers = await User.find({ _id: { $in: interviewerIds } });
    if (validInterviewers.length !== interviewerIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more interviewer IDs are invalid",
      });
    }

    // Kiểm tra trùng thời gian
    const currentDate = interview.date;
    const currentTime = interview.time;

    const conflictingInterviews = await Interview.find({
      _id: { $ne: interviewId }, // Loại trừ phỏng vấn hiện tại
      date: currentDate,
      time: currentTime,
      "stages.interviewerIds": { $in: interviewerIds },
    });

    if (conflictingInterviews.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "One or more interviewers are already assigned to another interview at the same time",
        conflictingInterviews: conflictingInterviews.map((i) => i._id),
      });
    }

    // Chỉ thêm những ID chưa có trong danh sách hiện tại
    const existingIds = stage.interviewerIds.map((id) => id.toString());
    const newIds = interviewerIds.filter((id) => !existingIds.includes(id));
    if (newIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All interviewers already assigned",
        data: interview,
      });
    }

    stage.interviewerIds.push(...newIds);
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interviewers added successfully",
      data: interview,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// Loại bỏ người phỏng vấn khỏi một vòng
const removeInterviewer = async (req, res) => {
  try {
    const { interviewId, round, interviewerId } = req.body;

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

    const stage = interview.stages.find((s) => s.round === round);
    if (!stage)
      return res
        .status(404)
        .json({ success: false, message: `Round ${round} not found` });

    stage.interviewerIds = stage.interviewerIds.filter(
      (id) => !id.equals(interviewerId)
    );
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interviewer removed successfully",
      data: interview,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { assignInterviewers, removeInterviewer };
