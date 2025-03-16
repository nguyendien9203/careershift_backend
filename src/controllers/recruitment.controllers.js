const Candidate = require("../models/candidate.model");
const Recruitment = require("../models/recruitment.model");
const Job = require("../models/job.model");
const { RecruitmentStage, RecruitmentStatus } = require("../constants/index");

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    console.log(jobId);
    const { message, candidate, cvFile, notes, continued, createdBy, updatedBy } = req.body;

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

    if(continued) {
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

  const recruitment =  await Recruitment.findOneAndUpdate({ jobId: req.params.jobId, candidateId: existingCandidate._id },
    { $set: { cvFile, notes, updatedBy } },
    { new: true, }).lean();
  console.log(recruitment);
  return res
    .status(200)
    .json({ message: message,
      recruitment,
     });
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

exports.updateRecruitment = async (req, res) => {
  try {
    const recruitmentId = req.params.recruitmentId; 
    const recruitment = await Recruitment.findById(recruitmentId);
    const candidate = await Candidate.findById(recruitment.candidateId);
    const { customer, cvFile, status, notes, updatedBy } = req.body;

    if(!recruitment) {
      return res.status(404).json({ message: "Ứng tuyển không tồn tại" });
    }
    if(!customer.name || !customer.phone || !customer.source || !customer.isPotential ||!cvFile || !status || !notes || !updatedBy) {
      return res.status(400).json({ message: "Dien thieu thong tin" });
    }
    if(customer.email !== candidate.email) {
      return res.status(400).json({ message: "Khong the cap nhat email moi khac email ban dau" });
    }

    const editedCandidate = await Candidate.findByIdAndUpdate( recruitment.candidateId, {
      $set: {
        name: customer.name,
        phone: customer.phone,
        source: customer.source,
        isPotential: customer.isPotential,
        updatedBy: updatedBy
      },
    }, { new: true });

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
    ).populate("candidateId", "-_id name email phone status isPotential").populate("jobId", "-_id title source_url").lean();

    
    res.status(200).json({ message: "Ứng tuyển được cập nhật", recruitment: updatedRecruitment });
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};

exports.getRecruitmentByJobId = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const recruitments = await Recruitment.find({ jobId: req.params.jobId })
      .populate("candidateId", "-_id name email phone status isPotential")
      .populate("jobId", "-_id title source_url")
      .lean();

    if (!recruitments.length) {
      return res.status(404).json({ message: "No recruitment found for this job" });
    }

    res.status(200).json({ message: "Recruitment fetched successfully", recruitments });
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
    res.status(200).json({ message: "Recruitment fetched successfully", recruitment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
