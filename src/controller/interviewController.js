const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const Recruitment = require("../models/Recruitment");

exports.getCandidatepassedinterview = async (req, res) => {
    try {
        const completedInterviews = await Interview.find({ finalStatus: "COMPLETED" })
            .select("recruitmentId");

        const recruitmentIds = completedInterviews.map((interview) => interview.recruitmentId);

        if (recruitmentIds.length === 0) {
            console.log("Không có ứng viên nào có finalStatus là COMPLETED.");
            return res.status(200).json({ message: "Không có ứng viên nào vượt qua phỏng vấn", emails: [] });
        }

        const recruitments = await Recruitment.find({ _id: { $in: recruitmentIds } })
            .select("candidateId");

        const candidateIds = recruitments.map((recruitment) => recruitment.candidateId);

        if (candidateIds.length === 0) {
            console.log("Không tìm thấy Candidate tương ứng.");
            return res.status(200).json({ message: "Không tìm thấy Candidate", emails: [] });
        }

        const candidates = await Candidate.find({ _id: { $in: candidateIds } })
            .select("email");

        const emails = candidates.map((candidate) => candidate.email);

        return res.status(200).json({ message: "Danh sách email ứng viên đã vượt qua phỏng vấn", emails });

    } catch (error) {
        console.error("Lỗi khi lấy email:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
