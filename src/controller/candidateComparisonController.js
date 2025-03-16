const mongoose = require("mongoose");
const CandidateComparison = require("../models/CandidateComparison");

exports.getCompletedComparisons = async () => {
    try {
        const completedComparisons = await CandidateComparison.find({ status: "COMPLETED" })
            .populate("jobId", "title") // Lấy thông tin job (chỉ lấy field 'title')
            .populate("selectedCandidateId", "name email phone"); // Lấy thông tin candidate (name, email, phone)

        if (!completedComparisons.length) {
            console.log("Không có dữ liệu nào với status COMPLETED.");
            return [];
        }

        // Format kết quả trả về
        return completedComparisons.map((comparison) => ({
            job: {
                id: comparison.jobId?._id.toString(),
                title: comparison.jobId?.title || "Unknown",
            },
            selectedCandidates: comparison.selectedCandidateId.map((candidate) => ({
                id: candidate._id.toString(),
                name: candidate.name || "Unknown",
                email: candidate.email || "N/A",
                phone: candidate.phone || "N/A",
            })),
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách so sánh ứng viên hoàn thành:", error);
        throw error;
    }
};

