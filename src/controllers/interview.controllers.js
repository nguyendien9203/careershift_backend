const express = require("express");
const Interview = require("../models/Interview");
const router = express.Router();

// Create an Interview
exports.createInterview = async (req, res, next) => {
    try {
        const { recruitmentId, stages, date, time, mode, address, google_meet_link } = req.body;
        const createdBy = req.user._id;
        const updatedBy = req.user._id;

        const newInterview = new Interview({
            recruitmentId,
            stages,
            finalStatus: "IN_PROGRESS",
            date,
            time,
            mode,
            address,
            google_meet_link,
            createdBy,
            updatedBy,
        });

        await newInterview.save();
        res.status(201).json({ message: "Interview created successfully", data: newInterview });
    } catch (error) {
        next(error);
    }
};

// Get all Interviews
exports.getInterviews = async (req, res, next) => {
    try {
        const interviews = await Interview.find()
            .populate("recruitmentId", "title")
            .populate("createdBy", "name")
            .populate("updatedBy", "name")
            .lean();

        if (!interviews.length) {
            return res.status(404).json({ message: "No interviews found" });
        }
        res.status(200).json({ message: "Interviews fetched successfully", data: interviews });
    } catch (error) {
        next(error);
    }
};

// Get Interview by ID
exports.getInterviewById = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate("recruitmentId", "title")
            .populate("createdBy", "name")
            .populate("updatedBy", "name");

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        res.status(200).json({ message: "Interview fetched successfully", data: interview });
    } catch (error) {
        next(error);
    }
};

// Update Interview
exports.updateInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        req.body.updatedBy = req.user._id;
        await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Interview updated successfully", data: interview });
    } catch (error) {
        next(error);
    }
};

// Delete Interview
exports.deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        await interview.deleteOne();
        res.status(200).json({ message: "Interview deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// Get Evaluation Summary
// exports.getEvaluationSummary = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       // Get interview 
//       const interview = await Interview.findById(id)
//         .populate("stages.evaluations.interviewerId", "name")
//         .lean();
  
//       if (!interview) {
//         return res.status(404).json({ message: "Interview not found" });
//       }
  
//       let roundSummaries = [];
  
//       // Fetch each stages 
//       interview.stages.forEach((stage) => {
//         let interviewerSummary = {};
  
//         // Duyệt qua từng đánh giá của vòng hiện tại
//         stage.evaluations.forEach((evaluation) => {
//           const interviewer = evaluation.interviewerId;
//           if (!interviewer) return;
  
//           const interviewerId = interviewer._id.toString();
//           if (!interviewerSummary[interviewerId]) {
//             interviewerSummary[interviewerId] = {
//               interviewerId: interviewerId,
//               interviewerName: interviewer.name,
//               averageScores: {},
//               totalScores: {},
//               scoreCounts: {},
//               comments: [],
//             };
//           }
  
//           // Summary scores by criteria
//           for (let key in evaluation.score) {
//             if (!interviewerSummary[interviewerId].totalScores[key]) {
//               interviewerSummary[interviewerId].totalScores[key] = 0;
//               interviewerSummary[interviewerId].scoreCounts[key] = 0;
//             }
//             interviewerSummary[interviewerId].totalScores[key] += evaluation.score[key];
//             interviewerSummary[interviewerId].scoreCounts[key] += 1;
//           }
  
//           // Save comments
//           if (evaluation.comments) {
//             interviewerSummary[interviewerId].comments.push(evaluation.comments);
//           }
//         });
  
//         // Evaluate the average score for each interviewer
//         Object.values(interviewerSummary).forEach((summary) => {
//           for (let key in summary.totalScores) {
//             summary.averageScores[key] = (summary.totalScores[key] / summary.scoreCounts[key]).toFixed(2);
//           }
//           delete summary.totalScores;
//           delete summary.scoreCounts;
//         });
  
//         // Save the result for each round
//         roundSummaries.push({
//           round: stage.round,
//           type: stage.type,
//           status: stage.status,
//           interviewers: Object.values(interviewerSummary),
//         });
//       });
  
//       res.json({
//         interviewId: id,
//         rounds: roundSummaries,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   };

  // Hàm tính điểm trung bình của interviewer trong một stage
const calculateAverageScores = (evaluations) => {
  const averageScores = {};

  evaluations.forEach(({ interviewerId, score }) => {
    if (!averageScores[interviewerId]) {
      averageScores[interviewerId] = { total: {}, count: 0 };
    }

    Object.entries(score).forEach(([criteria, value]) => {
      if (!averageScores[interviewerId].total[criteria]) {
        averageScores[interviewerId].total[criteria] = 0;
      }
      averageScores[interviewerId].total[criteria] += value;
    });

    averageScores[interviewerId].count += 1;
  });

  // Tính trung bình điểm
  Object.keys(averageScores).forEach((interviewerId) => {
    Object.keys(averageScores[interviewerId].total).forEach((criteria) => {
      averageScores[interviewerId].total[criteria] /= averageScores[interviewerId].count;
    });
  });

  return averageScores;
};

// API tính điểm trung bình cho từng interviewer trong từng stage
router.get("/:interviewId/average-scores", async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const stageAverages = interview.stages.map((stage) => ({
      round: stage.round,
      averageScores: calculateAverageScores(stage.evaluations),
    }));

    res.json({ interviewId, stageAverages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;