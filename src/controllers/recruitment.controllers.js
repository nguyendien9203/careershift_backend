const Candidate = require("../models/candidate.model");
const Recruitment = require("../models/recruitment.model");
const { RecruitmentStage, RecruitmentStatus } = require("../constants/index");

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    console.log(jobId);
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

// api update cái ứng tuyển đó
// api chấp nhận ứng viên
// api từ chối ứng viên

// Create candidate
// exports.createCandidate = async (req, res) => {
//   // Decode the token and get the user id there
//   // let token = req.headers.authorization;
//   try {
//     const { name, email, phone, source, cvFile, createdBy, updatedBy } =
//       req.body;
//     if (
//       await Candidate.findOne({
//         $or: [{ email }, { phone }],
//       })
//     ) {
//       const candidate = await Candidate.findOne({ email });
//       candidate.cvFile = cvFile;
//       candidate.updatedBy = updatedBy;
//       await candidate.save();
//       return res.status(200).json({
//         message: "Candidate already exists ",
//         data: candidate,
//       });
//     }
//     const newCandidate = new Candidate({
//       name,
//       email,
//       phone,
//       cvFile,
//       source,
//       createdBy,
//       updatedBy,
//     });
//     await newCandidate.save();
//     res
//       .status(201)
//       .json({ message: "Candidate created successfully", data: newCandidate });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Update candidate
// exports.updateCandidate = async (req, res) => {
//   // Decode the token and get the user id there
//   // let token = req.headers.authorization;
//   // updatedBy = req.user._id;
//   const candidate = await Candidate.findById(req.params.id);
//   // Check if candidate exists
//   if (!candidate) {
//     return res.status(404).json({ message: "Candidate not found" });
//   }
//   try {
//     await candidate.updateOne(req.body);
//     data = await Candidate.findById(req.params.id);
//     res
//       .status(200)
//       .json({ message: "Candidate updated successfully", data: data });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Delete candidate
// exports.deleteCandidate = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }
//     await candidate.deleteOne();
//     res
//       .status(200)
//       .json({ message: "Candidate deleted successfully", data: candidate });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get all candidates
// exports.getAllCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find();
//     if (candidates.length === 0) {
//       return res.status(404).json({ message: "No candidates found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Candidates fetched successfully", data: candidates });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get candidate by id
// exports.getCandidateById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Candidate fetched successfully", data: candidate });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.getCandidateByUserCreatedId = async (req, res) => {
//   try {
//     const candidates = await Candidate.find({ createdBy: req.params.id })
//       .populate("createdBy", "name")
//       .populate("updatedBy", "name")
//       .lean();
//     const formattedCandidates = candidates.map((candidate) => ({
//       ...candidate,
//       createdBy: candidate.createdBy.name,
//       updatedBy: candidate.updatedBy.name,
//     }));
//     if (candidates.length === 0) {
//       return res.status(404).json({ message: "No candidates found" });
//     }
//     res.status(200).json({
//       message: "Candidates fetched successfully",
//       data: formattedCandidates,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
