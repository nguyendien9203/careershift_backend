const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const Job = require("../models/Job");
const Recruitment = require("../models/Recruitment");
const mongoose = require("mongoose");

// Get all interviews
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
   

    return res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching interviews",
      error: error.message,
    });
  }
};

// Get interview by ID
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findById(id)
      .populate("recruitmentId", "candidateId jobJd status")
      .populate("stages.interviewerIds", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    return res.status(200).json({ success: true, data: interview });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Create new interview


const createInterview = async (req, res) => {
  try {
    const { recruitmentId, stages, date, time, mode, address, google_meet_link } = req.body;

    console.log("Received recruitmentId:", recruitmentId); // Debug log

    // Validate recruitmentId format
    if (!mongoose.Types.ObjectId.isValid(recruitmentId)) {
      return res.status(400).json({ success: false, message: "Id isValid" });
    }

    // Check if recruitment exists by ObjectId
    const recruitment = await Recruitment.findById(recruitmentId);
    console.log("Found recruitment:", recruitment); // Debug log
    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy recruitment với ID: ${recruitmentId}`,
      });
    }

    // Parse stages if it's a string
    const parsedStages = Array.isArray(stages) ? stages : JSON.parse(stages);

    // Validate each stage
    for (const stage of parsedStages) {
      if (!stage.round || !stage.type || !Array.isArray(stage.interviewerIds)) {
        return res.status(400).json({ success: false, message: "Invalid stage format" });
      }
      const interviewers = await User.find({ _id: { $in: stage.interviewerIds } });
      if (interviewers.length !== stage.interviewerIds.length) {
        return res.status(400).json({ success: false, message: "Invalid interviewer IDs" });
      }
      stage.evaluations = [];
    }

    // Create new interview
    const newInterview = new Interview({
      recruitmentId,
      stages: parsedStages,
      date,
      time,
      mode,
      address: mode === "OFFLINE" ? address : undefined,
      google_meet_link: mode === "ONLINE" ? google_meet_link : undefined,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    const savedInterview = await newInterview.save();

    return res.status(201).json({
      success: true,
      message: "Interview created successfully",
      data: savedInterview,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating interview",
      error: error.message,
    });
  }
};





// Update interview stage
const updateInterviewStage = async (req, res) => {
  try {
    const { interviewId, round, interviewerId, score, comments, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId) || !mongoose.Types.ObjectId.isValid(interviewerId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const stage = interview.stages.find((s) => s.round === round);
    if (!stage) {
      return res.status(404).json({ success: false, message: `Round ${round} not found` });
    }

    if (!stage.interviewerIds.some((id) => id.equals(interviewerId))) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to evaluate this stage",
      });
    }

    const evaluationIndex = stage.evaluations.findIndex((e) => e.interviewerId.equals(interviewerId));
    if (evaluationIndex > -1) {
      stage.evaluations[evaluationIndex] = { interviewerId, score, comments };
    } else {
      stage.evaluations.push({ interviewerId, score, comments });
    }

    if (status && ["SCHEDULED", "PASSED", "FAILED", "PENDING"].includes(status)) {
      stage.status = status;
    }

    interview.updatedBy = req.user?._id;
    await interview.save();

    return res.status(200).json({
      success: true,
      message: `Round ${round} updated successfully`,
      data: interview,
    });
  } catch (error) {
    console.error("Error updating stage:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete interview
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findByIdAndDelete(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update interview
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, mode, address, google_meet_link } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (date) interview.date = date;
    if (time) interview.time = time;
    if (mode) interview.mode = mode;
    if (mode === "OFFLINE") interview.address = address;
    if (mode === "ONLINE") interview.google_meet_link = google_meet_link;

    const allPassed = interview.stages.every((stage) => stage.status === "PASSED");
    const anyFailed = interview.stages.some((stage) => stage.status === "FAILED");
    interview.finalStatus = anyFailed ? "COMPLETED" : allPassed ? "COMPLETED" : "IN_PROGRESS";

    interview.updatedBy = req.user?._id;
    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterviewStage,
  deleteInterview,
  updateInterview
};