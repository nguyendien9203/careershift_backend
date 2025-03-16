const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const Recruitment = require("../models/Recruitment");
const { fetchCandidatesPassedInterview } = require("./interviewController");
const { sendSalaryProposalEmail, sendOnboardingEmail } = require("../config/mailer");
const Candidate = require("../models/Candidate");
const { getCompletedComparisons } = require("./candidateComparisonController");
const Job = require("../models/Job");


exports.createAndSendOffer = async (req, res) => {
    try {
        const { recruitmentId, baseSalary, salary, bonus, note } = req.body;
        const createdBy = req.user?.id; // ID của người tạo

        console.log("==> Nhận request:", { recruitmentId, baseSalary, salary, bonus, note, createdBy });

        if (!recruitmentId || !baseSalary || !salary) {
            console.log("Thiếu thông tin quan trọng!");
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin." });
        }

        // Lấy thông tin tuyển dụng
        const recruitment = await Recruitment.findById(recruitmentId).populate("candidateId");
        if (!recruitment) {
            console.log("Không tìm thấy thông tin tuyển dụng với ID:", recruitmentId);
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển dụng." });
        }
        console.log("Thông tin tuyển dụng:", recruitment);

        // Lấy danh sách các CandidateComparison đã hoàn thành
        const completedComparisons = await getCompletedComparisons();
        console.log("Danh sách completedComparisons:", completedComparisons);

        const candidateId = recruitment.candidateId._id.toString(); // Lấy ObjectId dưới dạng string
        console.log("Candidate ID từ recruitment:", candidateId);

        // Tìm danh sách đã hoàn thành theo jobId
        const completedComparison = completedComparisons.find(c => c.job.id === recruitment.jobId.toString());
        if (!completedComparison) {
            console.log("Không tìm thấy danh sách đã hoàn thành cho công việc với jobId:", recruitment.jobId);
            return res.status(400).json({ message: "Công việc này chưa có danh sách ứng viên được chọn hoàn thành." });
        }
        console.log("Danh sách hoàn thành tìm thấy:", completedComparison);

        const selectedCandidates = completedComparison.selectedCandidates.map(c => c.id.toString()); // Chuyển ObjectId sang string
        console.log("Danh sách selectedCandidates:", selectedCandidates);

        // Kiểm tra `candidateId` có trong danh sách `selectedCandidates` không
        if (!selectedCandidates.includes(candidateId)) {
            console.log("Ứng viên chưa nằm trong danh sách được chọn.");
            return res.status(400).json({ message: "Ứng viên này chưa nằm trong danh sách được chọn hoàn thành." });
        }

        // Tạo offer mới
        const offer = new Offer({
            recruitmentId,
            baseSalary,
            salary,
            bonus,
            note,
            createdBy,
            updatedBy: createdBy,
        });

        await offer.save();
        console.log("Offer đã được tạo thành công:", offer);

        const candidate = await Candidate.findById(recruitment.candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Không tìm thấy ứng viên." });
        }
        const job = await Job.findById(recruitment.jobId);
        const jobTitle = job ? job.title : "Không xác định";
        await sendSalaryProposalEmail(candidate, offer, jobTitle);

        return res.status(200).json({ message: "Offer đã được tạo thành công và email đã được gửi!", offer });
    } catch (error) {
        console.error("Lỗi khi tạo offer:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


exports.updateOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { negotiatedSalary, updatedBy } = req.body;

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        // Kiểm tra nếu có deal lương thì phải đặt approvalRequired = true
        if (negotiatedSalary && negotiatedSalary !== offer.salary) {
            if (negotiatedSalary < offer.baseSalary) {
                return res.status(400).json({ message: "Negotiated salary must be greater than or equal to base salary" });
            }
            if (negotiatedSalary > offer.salary * 1.15) {
                return res.status(400).json({ 
                    message: "Negotiated salary must not exceed 115% of the original salary" 
                });
            }
            offer.negotiatedSalary = negotiatedSalary;
            offer.approvalRequired = true; // Cần duyệt từ manager
            offer.status = "PENDING"; // Chuyển trạng thái chờ duyệt
        }

        offer.updatedBy = updatedBy;
        await offer.save();
        res.status(200).json({ message: "Offer updated, pending manager approval", offer });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


exports.managerApproveOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { action, updatedBy } = req.body; // action = "ACCEPT" hoặc "REJECT"

        console.log(" Nhận yêu cầu duyệt offer:", { offerId, action, updatedBy });

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        console.log(" Offer tìm thấy:", offer);

        if (offer.status !== "PENDING" || !offer.approvalRequired) {
            return res.status(400).json({ message: "Offer is not pending approval" });
        }

        // Lấy thông tin recruitment
        const recruitmentData = await Recruitment.findById(offer.recruitmentId).lean();
        console.log(" Dữ liệu tuyển dụng:", recruitmentData);

        if (!recruitmentData) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển dụng." });
        }

        if (!recruitmentData.candidateId) {
            console.log(" Lỗi: recruitmentData.candidateId bị undefined!");
            return res.status(400).json({ message: "Dữ liệu tuyển dụng không có candidateId." });
        }

        // Lấy danh sách ứng viên đã vượt phỏng vấn
        const candidates = await fetchCandidatesPassedInterview();
        console.log(" Danh sách ứng viên vượt phỏng vấn:", candidates);

        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy danh sách ứng viên." });
        }

        // Tìm ứng viên trong danh sách đã vượt phỏng vấn
        const candidate = candidates.find((c) => c._id?.toString() === recruitmentData.candidateId?.toString());

        if (!candidate) {
            console.log(" Không tìm thấy ứng viên trong danh sách!", { candidateId: recruitmentData.candidateId });
            return res.status(404).json({ message: "Không tìm thấy ứng viên." });
        }

        console.log(" Ứng viên tìm thấy:", candidate);

        if (action === "ACCEPT") {
            offer.salary = offer.negotiatedSalary;
            offer.status = "SENT";
            offer.managerStatus = "APPROVED";
        } else if (action === "REJECT") {
            offer.negotiatedSalary = null;
            offer.status = "SENT";
            offer.managerStatus = "REJECTED";
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        offer.approvalRequired = false; // Đã duyệt xong
        offer.updatedBy = updatedBy;
        await offer.save();

        await sendSalaryProposalEmail(candidate, offer);

        res.status(200).json({ message: `Offer ${action} by manager and email sent`, offer });
    } catch (error) {
        console.error(" Lỗi khi duyệt offer:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
exports.hrUpdateOfferStatus = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { action, updatedBy } = req.body; // action = "ACCEPT" hoặc "REJECT"

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        if (offer.status !== "SENT") {
            return res.status(400).json({ message: "Offer is not in a valid state for HR update" });
        }

        // Lấy thông tin recruitment để xác định candidate
        const recruitmentData = await Recruitment.findById(offer.recruitmentId).lean();
        if (!recruitmentData || !recruitmentData.candidateId) {
            return res.status(404).json({ message: "Recruitment data not found or missing candidateId" });
        }

        // Lấy danh sách ứng viên đã vượt phỏng vấn
        const candidates = await fetchCandidatesPassedInterview();
        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            return res.status(404).json({ message: "No candidates found" });
        }

        // Tìm ứng viên trong danh sách
        const candidate = candidates.find((c) => c._id?.toString() === recruitmentData.candidateId?.toString());
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        if (action === "ACCEPT") {
            offer.status = "ACCEPTED";

            if (!candidate || !candidate.email) {
                console.error("❌ Candidate email is missing or undefined.", candidate);
            } else {
                try {
                    await sendOnboardingEmail(candidate, offer);
                } catch (emailError) {
                    console.error("❌ Failed to send onboarding email:", emailError);
                }
            }
        } else if (action === "REJECT") {
            offer.status = "REJECTED";
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        if (updatedBy) {
            offer.updatedBy = updatedBy;
        }
        await offer.save();

        res.status(200).json({ message: `Offer status updated to ${offer.status}`, offer });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
