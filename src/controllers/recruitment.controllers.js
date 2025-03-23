const Candidate = require("../models/candidate.model");
const Recruitment = require("../models/recruitment.model");
const Job = require("../models/job.model");
const { RecruitmentStage, RecruitmentStatus } = require("../constants/index");
const { sendInterviewEmailToCandidate } = require("../config/email");

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    console.log(jobId);
    const {
      message,
      candidate,
      cvFile,
      notes,
      continued,
      createdBy,
      updatedBy,
    } = req.body;

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

    if (continued) {
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
    }

    const recruitment = await Recruitment.findOneAndUpdate(
      { jobId: req.params.jobId, candidateId: existingCandidate._id },
      { $set: { cvFile, notes, updatedBy } },
      { new: true }
    ).lean();
    console.log(recruitment);
    return res.status(200).json({ message: message, recruitment });
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
      [RecruitmentStage.REJECTED]: [],
      [RecruitmentStage.SCREENING]: [],
      [RecruitmentStage.INTERVIEWING]: [],
      [RecruitmentStage.OFFER_SIGNING]: [],
    };

    recruitments.forEach((recruitment) => {
      const formattedRecruitment = {
        ...recruitment,
        candidate: recruitment.candidateId,
      };
      switch (recruitment.status) {
        case RecruitmentStatus.ON_PROGRESS:
          stageData[RecruitmentStage.SCREENING].push(formattedRecruitment);
          break;
        case RecruitmentStatus.INTERVIEW:
          stageData[RecruitmentStage.INTERVIEWING].push(formattedRecruitment);
          break;
        case RecruitmentStatus.HIRED:
          stageData[RecruitmentStage.OFFER_SIGNING].push(formattedRecruitment);
          break;
        case RecruitmentStatus.REJECTED:
          stageData[RecruitmentStage.REJECTED].push(formattedRecruitment);
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

exports.updateRecruitment = async (req, res) => {
  try {
    const recruitmentId = req.params.recruitmentId;
    const recruitment = await Recruitment.findById(recruitmentId);
    const candidateCurrent = await Candidate.findById(recruitment.candidateId);
    const { candidate, cvFile, status, notes, updatedBy } = req.body;

    if (!recruitment) {
      return res.status(404).json({ message: "Ứng tuyển không tồn tại" });
    }
    if (
      !candidate.name ||
      !candidate.phone ||
      !candidate.source ||
      !candidate.isPotential ||
      !cvFile ||
      !status ||
      !notes ||
      !updatedBy
    ) {
      return res.status(400).json({ message: "Dien thieu thong tin" });
    }
    if (candidate.email !== candidateCurrent.email) {
      return res
        .status(400)
        .json({ message: "Khong the cap nhat email moi khac email ban dau" });
    }

    const editedCandidate = await Candidate.findByIdAndUpdate(
      recruitment.candidateId,
      {
        $set: {
          name: candidate.name,
          phone: candidate.phone,
          source: candidate.source,
          isPotential: candidate.isPotential,
          updatedBy: updatedBy,
        },
      },
      { new: true }
    );

    const updatedRecruitment = await Recruitment.findByIdAndUpdate(
      recruitmentId,
      {
        $set: {
          cvFile,
          status,
          notes,
          updatedBy,
        },
      },
      { new: true }
    )
      .populate("candidateId", "-_id name email phone status isPotential")
      .populate("jobId", "-_id title source_url")
      .lean();

    res.status(200).json({
      message: "Ứng tuyển được cập nhật",
      recruitment: updatedRecruitment,
    });
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

exports.getRecruitmentById = async (req, res) => {
  try {
    const recruitment = await Recruitment.findById(req.params.recruitmentId)
      .populate("candidateId", "-_id name email phone status isPotential")
      .populate("jobId", "-_id title source_url")
      .lean();
    if (!recruitment) {
      return res.status(404).json({ message: "Recruitment not found" });
    }
    res
      .status(200)
      .json({ message: "Recruitment fetched successfully", recruitment });
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
        status: 404,
        message: "Không tìm thấy thông tin tuyển dụng",
      });
    }

    recruitment.status = status;
    await recruitment.save();

    return res.status(200).json({
      status: 200,
      message: "Đã cập nhật trạng thái tuyển dụng",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
