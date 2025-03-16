const Interview = require('../models/Interview');
const User = require('../models/User');
const Recruitment = require('../models/Recruitment');
const mongoose = require('mongoose');



// Xem đánh giá của một người phỏng vấn trong một phỏng vấn 
const viewEvaluations = async (req, res) => {
    try {
        const { interviewId, interviewerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(interviewId) || !mongoose.Types.ObjectId.isValid(interviewerId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const evaluations = interview.stages
            .flatMap(stage => stage.evaluations)
            .filter(e => e.interviewerId.equals(interviewerId));

        res.status(200).json({ success: true, data: evaluations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
            return res.status(404).json({ success: false, message: "No recruitments found" });
        }

        // Lấy tất cả các interview liên quan đến các recruitment
        const recruitmentIds = recruitments.map(r => r._id);
        const interviews = await Interview.find({ recruitmentId: { $in: recruitmentIds } })
            .populate("stages.evaluations.interviewerId", "name"); // Lấy tên người phỏng vấn

        if (!interviews || interviews.length === 0) {
            return res.status(404).json({ success: false, message: "No interviews found" });
        }

        // Tổng hợp dữ liệu theo ứng viên
        const summary = recruitments.map(recruitment => {
            const candidateInterviews = interviews.filter(interview => 
                interview.recruitmentId.toString() === recruitment._id.toString()
            );

            const evaluations = candidateInterviews.flatMap(interview => 
                interview.stages.flatMap(stage => 
                    stage.evaluations.map(evaluation => ({
                        score: evaluation.score,
                        comments: evaluation.comments || "N/A",
                        interviewer: evaluation.interviewerId ? evaluation.interviewerId.name : "Unknown"
                    }))
                )
            );

            return {
                candidateName: recruitment.candidateId ? recruitment.candidateId.name : "Unknown Candidate",
                jobTitle: recruitment.jobJd && recruitment.jobJd.title ? recruitment.jobJd.title : "Unknown Job",
                evaluations: evaluations.length > 0 ? evaluations : "No evaluations yet"
            };
        });

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error("Error fetching evaluation summary:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

//update pass/fail từng vòng phỏng vấn
const updatePassFail = async (req, res) => {
    try {
      const { interviewId, round, status } = req.body;
  
      
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        return res.status(400).json({ success: false, message: "Invalid interview ID" });
      }
      if (!round || typeof round !== "number" || round < 1) {
        return res.status(400).json({ success: false, message: "Invalid round number" });
      }
      if (!["PASSED", "FAILED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'PASSED' or 'FAILED'",
        });
      }
  
      // Find the interview
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ success: false, message: "Interview not found" });
      }
  
      // Find the stage by round
      const stage = interview.stages.find((s) => s.round === round);
      if (!stage) {
        return res.status(404).json({ success: false, message: `Round ${round} not found` });
      }
  
      // Update the stage status
      stage.status = status;
  
      // Update the updatedBy field
      interview.updatedBy = req.user?._id;
  
      // Save the changes
      const updatedInterview = await interview.save();
  
      return res.status(200).json({
        success: true,
        message: `Round ${round} updated to ${status} successfully`,
        data: updatedInterview,
      });
    } catch (error) {
      console.error("Error updating pass/fail status:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while updating pass/fail status",
        error: error.message,
      });
    }
  };
module.exports = {viewEvaluations, getEvaluationSummary ,updatePassFail};