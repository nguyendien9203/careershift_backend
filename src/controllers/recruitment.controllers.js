const Candidate = require("../models/candidate.model");
const Recruitment = require("../models/recruitment.model");
const Job = require("../models/job.model");
const { RecruitmentStage, RecruitmentStatus } = require("../constants/index");
const { sendInterviewEmailToCandidate } = require("../config/email");

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { candidate, cvFile, notes, createdBy, updatedBy } = req.body;

    if (!candidate || !candidate.email) {
      return res.status(400).json({ message: "Candidate email is required" });
    }

    if (!cvFile || !cvFile.fileName) {
      return res.status(400).json({ message: "CV file is required" });
    }

    let existingCandidate = await Candidate.findOne({ email: candidate.email });

    if (!existingCandidate) {
      existingCandidate = new Candidate({
        ...candidate,
        createdBy,
        updatedBy,
      });

      await existingCandidate.save();
    }

    const newRecruitment = new Recruitment({
      candidateId: existingCandidate._id,
      jobId,
      cvFile,
      notes,
      createdBy,
      updatedBy,
    });

    await newRecruitment.save();

    return res
      .status(201)
      .json({ message: "Ứng tuyển thành công", recruitment: newRecruitment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCandidatesByStage = async (req, res) => {
  try {
    const recruitments = await Recruitment.find({ jobId: req.params.jobId })
      .populate("candidateId")
      .lean();

    const stageData = {
      [RecruitmentStage.SCREENING]: [],
      [RecruitmentStage.INTERVIEWING]: [],
      [RecruitmentStage.OFFER_SIGNING]: [],
      rejectedCandidates: [],
    };

    recruitments.forEach((recruitment) => {
      switch (recruitment.status) {
        case RecruitmentStatus.ON_PROGRESS:
          stageData[RecruitmentStage.SCREENING].push(recruitment);
          break;
        case RecruitmentStatus.INTERVIEW:
          stageData[RecruitmentStage.INTERVIEWING].push(recruitment);
          break;
        case RecruitmentStatus.HIRED:
          stageData[RecruitmentStage.OFFER_SIGNING].push(recruitment);
          break;
        case RecruitmentStatus.REJECTED:
          stageData.rejectedCandidates.push(recruitment);
          break;
      }
    });

    return res.status(200).json(stageData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRecruitment = async (req, res) => {
  try {
    const recruitmentId = req.params.recruitmentId;

    const recruitment = await Recruitment.findById(recruitmentId);
    if (!recruitment) {
      return res.status(404).json({ message: "Ứng tuyển không tồn tại" });
    }

    await recruitment.deleteOne();
    res.status(200).json({ message: "Ứng tuyển đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendInterviewInvitation = async (req, res) => {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({
        message: "Vui lòng nhập thời hạn phản hồi lời mời phỏng vấn.",
      });
    }

    const recruitment = await Recruitment.findById(req.params.recruitmentId);
    if (!recruitment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin tuyển dụng" });
    }

    const job = await Job.findById(recruitment.jobId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy vị trí công việc" });
    }

    const candidate = await Candidate.findById(recruitment.candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thông tin ứng viên" });
    }

    const { success, message } = await sendInterviewEmailToCandidate(
      candidate,
      job.title,
      deadline
    );

    if (!success) return res.status(500).json({ message: message });

    return res.status(200).json({ message: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRecruitmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Vui lòng nhập trạng thái ứng tuyển",
      });
    }

    const recruitment = await Recruitment.findById(req.params.recruitmentId);
    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin tuyển dụng",
      });
    }

    recruitment.status = status;
    await recruitment.save();

    return res.status(200).json({
      message: `Đã cập nhật trạng thái tuyển dụng thành ${status}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// api update cái ứng tuyển đó
