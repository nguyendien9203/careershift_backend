const Interview = require("../models/interview.model");

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

exports.evaluationSummary = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm interview theo ID
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    let overallTotalScore = 0;
    let overallTotalCount = 0;
    
    // Duyệt qua từng vòng để tính điểm trung bình
    const stageAverages = interview.stages.map((stage) => {
      let stageTotalScore = 0;
      let stageTotalCount = 0;
    
      stage.evaluations.forEach((evaluation) => {
        if (evaluation.score) {
          // Chuyển evaluation.score sang plain object
          const scoreData = JSON.parse(JSON.stringify(evaluation.score));
          const scores = Object.values(scoreData).map(Number);
          
          const validScores = scores.filter((val) => !isNaN(val)); // Lọc bỏ NaN
          const sum = validScores.reduce((acc, val) => acc + val, 0);
          
          stageTotalScore += sum;
          stageTotalCount += validScores.length;
        }
      });
      
      // Cập nhật tổng chung
      overallTotalScore += stageTotalScore;
      overallTotalCount += stageTotalCount;

      // Tính trung bình vòng
      const stageAverageScore =
        stageTotalCount > 0 ? (stageTotalScore / stageTotalCount).toFixed(2) : "0";

      console.log(`Stage ${stage.round} - Total Score: ${stageTotalScore}, Count: ${stageTotalCount}, Average: ${stageAverageScore}`);
      
      return {
        round: stage.round,
        type: stage.type,
        status: stage.status,
        averageScore: stageAverageScore,
      };
    });
    
    // Tính trung bình tổng của tất cả các vòng
    const overallAverage =
      overallTotalCount > 0 ? (overallTotalScore / overallTotalCount).toFixed(2) : "0";

    console.log("Overall Total Score:", overallTotalScore);
    console.log("Overall Total Count:", overallTotalCount);
    console.log("Overall Average:", overallAverage);

    res.status(200).json({ interviewId: id, stageAverages, overallAverage });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
