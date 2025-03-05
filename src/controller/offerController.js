const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const Recruitment = require("../models/Recruitment");
const { fetchCandidatesPassedInterview } = require("./interviewController");
const { sendSalaryProposalEmail } = require("../config/mailer");

exports.createAndSendOffer = async (req, res) => {
    try {
        const { recruitmentId, baseSalary, salary, bonus, note } = req.body;
        const createdBy = req.user?.id; // Giả sử bạn có middleware xác thực để lấy user ID

        if (!recruitmentId || !baseSalary || !salary) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin." });
        }

        // Kiểm tra recruitmentId hợp lệ
        const recruitment = await Recruitment.findById(recruitmentId);
        if (!recruitment) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển dụng." });
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

        // Lấy thông tin ứng viên
        const candidates = await fetchCandidatesPassedInterview();
        const recruitmentData = await Recruitment.findById(recruitmentId); // Lấy dữ liệu trước
        const candidate = candidates.find((c) => c.email === recruitmentData.candidateId.toString());

        if (!candidate) {
            return res.status(404).json({ message: "Không tìm thấy ứng viên." });
        }


        // Gửi email
        await sendSalaryProposalEmail(candidate, offer);

        return res.status(200).json({ message: "Offer đã được tạo và gửi thành công!", offer });
    } catch (error) {
        console.error("❌ Lỗi khi tạo và gửi offer:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

