const mongoose = require("mongoose");
const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");
const Recruitment = require("../models/recruitment.model");
const Job = require("../models/job.model");

exports.fetchCandidatesPassedInterview = async () => {
    try {
        const completedInterviews = await Interview.find({ finalStatus: "COMPLETED" })
            .select("recruitmentId");

        const recruitmentIds = completedInterviews.map((interview) => interview.recruitmentId);
        if (recruitmentIds.length === 0) {
            console.log("Không có ứng viên nào có finalStatus là COMPLETED.");
            return [];
        }

        const recruitments = await Recruitment.find({ _id: { $in: recruitmentIds } }).select("candidateId jobId");
        if (!recruitments.length) {
            return [];
        }

        const candidateIds = recruitments.map((r) => r.candidateId);
        const jobIdIds = recruitments.map((r) => r.jobId);

        const jobs = await Job.find({ _id: { $in: jobIdIds } }).select("title");
        const jobMap = new Map(jobs.map((job) => [job._id.toString(), job.title]));

        const candidates = await Candidate.find({ _id: { $in: candidateIds } })
            .select("name email phone");

        const candidateMap = new Map(candidates.map((c) => [c._id.toString(), c]));

        const result = recruitments.map((r) => {
            const candidate = candidateMap.get(r.candidateId.toString());
            const jobName = jobMap.get(r.jobId?.toString()) || "Unknown";

            return {
                _id: candidate?._id.toString(),
                name: candidate?.name || "Unknown",
                email: candidate?.email || "N/A",
                phone: candidate?.phone || "N/A",
                job: jobName
            };
        });

        return result;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ứng viên:", error);
        throw error;
    }
};
exports.getCandidatepassedinterview = async (req, res) => {
    try {
        const candidates = await exports.fetchCandidatesPassedInterview();
        return res.status(200).json({
            message: "Danh sách ứng viên đã vượt qua phỏng vấn",
            candidates
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
