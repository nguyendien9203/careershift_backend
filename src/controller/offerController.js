const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const Recruitment = require("../models/Recruitment");
const { fetchCandidatesPassedInterview } = require("./interviewController");
const { sendSalaryProposalEmail } = require("../config/mailer");
const Candidate = require("../models/Candidate");

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
        const candidates = await fetchCandidatesPassedInterview();
        console.log(" Danh sách ứng viên vượt phỏng vấn:", candidates);
        
        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy danh sách ứng viên." });
        }
        
        const recruitmentData = await Recruitment.findById(recruitmentId).lean();
        console.log(" Dữ liệu tuyển dụng:", recruitmentData);
        
        if (!recruitmentData) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển dụng." });
        }
        
        if (!recruitmentData.candidateId) {
            console.log(" Lỗi: recruitmentData.candidateId bị undefined!");
            return res.status(400).json({ message: "Dữ liệu tuyển dụng không có candidateId." });
        }
        
        // Tìm ứng viên trong danh sách đã vượt phỏng vấn
        const candidate = candidates.find((c) => c._id?.toString() === recruitmentData.candidateId?.toString());
        
        if (!candidate) {
            console.log(" Không tìm thấy ứng viên trong danh sách!", { candidateId: recruitmentData.candidateId });
            return res.status(404).json({ message: "Không tìm thấy ứng viên." });
        }
        
        await sendSalaryProposalEmail(candidate, offer);        
        

        return res.status(200).json({ message: "Offer đã được tạo và gửi thành công!", offer });
    } catch (error) {
        console.error(" Lỗi khi tạo và gửi offer:", error);
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
  

  
  