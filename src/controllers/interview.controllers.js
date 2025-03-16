const Interview = require("../models/interview.model");
const Recruitment = require("../models/recruitment.model");

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

// Evaluation Summary
exports.evaluationSummary = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Bước 1: Lấy danh sách recruitments và populate candidateId
    const recruitments = await Recruitment.find({ jobId })
      .populate({ path: "jobId", select: "title" })
      .populate({ path: "candidateId", select: "name" })
      .lean();

    console.log("Recruitments Data:", JSON.stringify(recruitments, null, 2));

    if (!recruitments.length) {
      return res.json({ jobId, title: null, candidates: [] });
    }

    const title = recruitments[0]?.jobId?.title || "Unknown Job";
    const recruitmentIds = recruitments.map((rec) => rec._id);
    console.log("Recruitment IDs:", recruitmentIds);

    // Bước 2: Lấy danh sách Interviews với populate recruitmentId và candidateId
    const interviews = await Interview.find({ recruitmentId: { $in: recruitmentIds } })
      .populate({
        path: "recruitmentId",
        populate: { path: "candidateId", select: "name" }
      })
      .lean();

    console.log("Interviews Data:", JSON.stringify(interviews, null, 2));

    let candidateData = {};

    // Bước 3: Tính điểm trung bình từ evaluations
    interviews.forEach((interview) => {
      const candidateId = interview.recruitmentId?.candidateId?._id?.toString();
      if (!candidateId) {
        console.log("Candidate ID not found for interview:", interview._id);
        return;
      }

      if (!candidateData[candidateId]) {
        candidateData[candidateId] = {
          name: interview.recruitmentId.candidateId.name || "Unknown",
          totalScore: 0,
          count: 0
        };
      }

      let overallTotalScore = 0;
      let overallTotalCount = 0;

      interview.stages.forEach((stage) => {
        stage.evaluations.forEach((evaluation) => {
          if (evaluation?.score) {
            const scores = Object.values(evaluation.score).map(Number).filter((val) => !isNaN(val));
            overallTotalScore += scores.reduce((acc, val) => acc + val, 0);
            overallTotalCount += scores.length;
          }
        });
      });

      const overallAverage = overallTotalCount > 0 ? (overallTotalScore / overallTotalCount).toFixed(2) : "0";
      candidateData[candidateId].totalScore += parseFloat(overallAverage);
      candidateData[candidateId].count += 1;
    });

    // Chuẩn bị kết quả trả về
    const candidates = Object.keys(candidateData).map((candidateId) => ({
      candidateId,
      name: candidateData[candidateId].name,
      overallAverage: candidateData[candidateId].count > 0
        ? (candidateData[candidateId].totalScore / candidateData[candidateId].count).toFixed(2)
        : "0"
    }));

    console.log("Final Candidates:", candidates);

    return res.json({ jobId, title, candidates });
  } catch (error) {
    console.error("Error in evaluationSummary:", error);
    next(error);
  }
};

