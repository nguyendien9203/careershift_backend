const Interview = require("../models/interview.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Xem phỏng vấn theo Recruitment
const getInterviewsByRecruitment = async (req, res) => {
  try {
    const { recruitmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recruitmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recruitment ID" });
    }

    const interviews = await Interview.find({ recruitmentId })
      .populate("stages.interviewerIds", "name email")
      .populate("createdBy", "name email");

    res
      .status(200)
      .json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Xem các phỏng vấn sắp tới
const getUpcomingInterviews = async (req, res) => {
  try {
    const today = new Date();
    const interviews = await Interview.find({ date: { $gte: today } })
      .populate("stages.interviewerIds", "name email")
      .populate("recruitmentId", "candidateId jobId");

    res
      .status(200)
      .json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// Hiển thị công việc của interview
const getInterviewerWorkload = async (req, res) => {
  try {
    const { interviewerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interviewer ID" });
    }

    const interviews = await Interview.find({
      "stages.interviewerIds": interviewerId,
    }).populate("recruitmentId", "candidateId jobId");

    res
      .status(200)
      .json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Xem chi tiết các vòng phỏng vấn
const getInterviewStages = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview ID" });
    }

    const interview = await Interview.findById(interviewId)
      .populate("stages.interviewerIds", "name email") // Populate thông tin người phỏng vấn
      .populate("stages.evaluations.interviewerId", "name email"); // Populate thông tin người đánh giá

    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });
    }

    res.status(200).json({ success: true, data: interview.stages });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//Update mode
const updateInterviewMode = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { mode, google_meet_link, address } = req.body;

    // Validate interviewId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview ID" });
    }

    // Validate mode
    if (!["ONLINE", "OFFLINE"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be either 'ONLINE' or 'OFFLINE'",
      });
    }

    // Find the interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });
    }

    // Check required fields based on mode
    if (
      mode === "ONLINE" &&
      (!google_meet_link || typeof google_meet_link !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Google Meet link is required for ONLINE mode",
      });
    }
    if (mode === "OFFLINE" && (!address || typeof address !== "string")) {
      return res.status(400).json({
        success: false,
        message: "Address is required for OFFLINE mode",
      });
    }

    // Update mode and related fields
    interview.mode = mode;
    if (mode === "ONLINE") {
      interview.google_meet_link = google_meet_link;
      interview.address = undefined; // Xóa address nếu chuyển sang ONLINE
    } else if (mode === "OFFLINE") {
      interview.address = address;
      interview.google_meet_link = undefined; // Xóa link nếu chuyển sang OFFLINE
    }

    // Update the updatedBy field
    interview.updatedBy = req.user?._id;

    // Save the changes
    await interview.save();

    // Convert to object and define field order
    const interviewObj = interview.toObject();
    const orderedInterview = {
      _id: interviewObj._id,
      recruitmentId: interviewObj.recruitmentId,
      stages: interviewObj.stages,
      date: interviewObj.date,
      time: interviewObj.time,
      mode: interviewObj.mode,
      address: interviewObj.address, // Đặt address trước createdAt
      google_meet_link: interviewObj.google_meet_link,
      createdAt: interviewObj.createdAt, // Từ timestamps
      updatedAt: interviewObj.updatedAt, // Từ timestamps
      createdBy: interviewObj.createdBy,
      updatedBy: interviewObj.updatedBy,
    };

    return res.status(200).json({
      success: true,
      message: `Interview mode updated to ${mode} successfully`,
      data: orderedInterview,
    });
  } catch (error) {
    console.error("Error updating interview mode:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating interview mode",
      error: error.message,
    });
  }
};

// Update date time và check người phỏng vấn có bị trùng time..
const updateInterviewDateTime = async (req, res) => {
  try {
    const { interviewId, date, time } = req.body;

    // Validate interviewId format
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview ID format" });
    }

    // Validate required fields
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required",
      });
    }

    // Validate date and time format
    const interviewDateTime = new Date(`${date}T${time}`);
    if (isNaN(interviewDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time format",
      });
    }

    // Check if interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy interview với ID: ${interviewId}`,
      });
    }

    // Get all interviewer IDs from all stages
    const interviewerIds = [
      ...new Set(interview.stages.flatMap((stage) => stage.interviewerIds)),
    ];

    // Check for conflicting interviews for all interviewers
    const conflictingInterviews = await Interview.find({
      _id: { $ne: interviewId }, // Exclude current interview
      date,
      time,
      "stages.interviewerIds": { $in: interviewerIds },
    });

    // If there are conflicting interviews, find busy interviewers
    if (conflictingInterviews.length > 0) {
      const busyInterviewers = new Set();

      conflictingInterviews.forEach((conflictingInterview) => {
        conflictingInterview.stages.forEach((stage) => {
          stage.interviewerIds.forEach((interviewerId) => {
            if (interviewerIds.map(String).includes(String(interviewerId))) {
              busyInterviewers.add(String(interviewerId));
            }
          });
        });
      });

      return res.status(409).json({
        success: false,
        message:
          "Some interviewers are busy at the selected date and time. Please choose different interviewers or change the date/time.",
        busyInterviewers: Array.from(busyInterviewers),
      });
    }

    // Update date and time
    interview.date = date;
    interview.time = time;
    interview.updatedBy = req.user?._id;

    // Save the changes
    const updatedInterview = await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview date and time updated successfully",
      data: {
        interviewId: updatedInterview._id,
        date: updatedInterview.date,
        time: updatedInterview.time,
      },
    });
  } catch (error) {
    console.error("Error updating interview date and time:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating interview date and time",
      error: error.message,
    });
  }
};
module.exports = {
  getInterviewsByRecruitment,
  getUpcomingInterviews,
  getInterviewerWorkload,
  getInterviewStages,
  updateInterviewMode,
  updateInterviewDateTime,
};
