const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const Recruitment = require("../models/Recruitment");
const Job = require("../models/Job");

exports.getCandidatepassedinterview = async (req, res) => {
    try {
        const completedInterviews = await Interview.find({ finalStatus: "COMPLETED" })
            .select("recruitmentId");

        const recruitmentIds = completedInterviews.map((interview) => interview.recruitmentId);

        if (recruitmentIds.length === 0) {
            console.log("Không có ứng viên nào có finalStatus là COMPLETED.");
            return res.status(200).json({ message: "Không có ứng viên nào vượt qua phỏng vấn", emails: [] });
        }

        const recruitments = await Recruitment.find({ _id: { $in: recruitmentIds } }).select("candidateId jobJd");

        if (!recruitments.length) {
            return res.status(200).json({ message: "Không tìm thấy Recruitment tương ứng" });
        }

        const candidateIds = recruitments.map((r) => r.candidateId);
        const jobJdIds = recruitments.map((r) => r.jobJd);

        const jobs = await Job.find({ _id: { $in: jobJdIds } }).select("title");
        const jobMap = new Map(jobs.map((job) => [job._id.toString(), job.title]));

        const candidates = await Candidate.find({ _id: { $in: candidateIds } })
            .select("name email phone");

        const candidateMap = new Map(candidates.map((c) => [c._id.toString(), c]));

        const result = recruitments.map((r) => {
            const candidate = candidateMap.get(r.candidateId.toString());
            const jobName = jobMap.get(r.jobJd?.toString()) || "Unknown";

            return {
                name: candidate?.name || "Unknown",
                email: candidate?.email || "N/A",
                phone: candidate?.phone || "N/A",
                job: jobName
            };
        });

        return res.status(200).json({
            message: "Danh sách ứng viên đã vượt qua phỏng vấn",
            candidates: result
        });


    } catch (error) {
        console.error("Lỗi khi lấy email:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
