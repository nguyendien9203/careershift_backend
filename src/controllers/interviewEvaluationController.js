const Interview = require('../models/Interview');
const User = require('../models/User');
const Recruitment = require('../models/Recruitment');
const mongoose = require('mongoose');

// Gửi đánh giá 
const submitEvaluation = async (req, res) => {
    try {
        const { interviewId, round, interviewerId, score, comments } = req.body;

        if (!mongoose.Types.ObjectId.isValid(interviewId) || !mongoose.Types.ObjectId.isValid(interviewerId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const stage = interview.stages.find(s => s.round === round);
        if (!stage) return res.status(404).json({ success: false, message: `Round ${round} not found` });

        stage.evaluations.push({ interviewerId, score, comments });
        await interview.save();

        res.status(200).json({ success: true, message: 'Evaluation submitted successfully', data: interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

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

// Tổng hợp kết quả phỏng vấn theo ứng viên, người phỏng vấn, score, và comment
const getEvaluationSummary = async (req, res) => {
    try {
        const { interviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid interview ID' });
        }

        // Lấy thông tin phỏng vấn
        const interview = await Interview.findById(interviewId)
            .populate('stages.evaluations.interviewerId', 'name email'); // Populate thông tin người phỏng vấn

        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        // Lấy thông tin recruitment để lấy candidateId
        const recruitment = await Recruitment.findById(interview.recruitmentId);
        if (!recruitment) {
            return res.status(404).json({ success: false, message: 'Recruitment not found' });
        }

        // Tổng hợp dữ liệu
        const summary = {
            candidateId: recruitment.candidateId,
            stages: interview.stages.map(stage => ({
                type: stage.type,
                status: stage.status,
                evaluations: stage.evaluations.map(evaluation => ({
                    interviewerId: evaluation.interviewerId,
                    score: evaluation.score,
                    comments: evaluation.comments
                }))
            }))
        };

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};



//update pass/fail từng vòng phỏng vấn
const updatePassFail = async (req, res) => {
    try {
      const { interviewId, round, status } = req.body;
  
      // Validate input
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
module.exports = { submitEvaluation, viewEvaluations, getEvaluationSummary ,updatePassFail};