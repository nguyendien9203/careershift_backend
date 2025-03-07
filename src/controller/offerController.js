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
};};
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
  
      if (action === "ACCEPT") {
        offer.status = "ACCEPTED";
        sendOnboardingEmail(offer); // Gửi email onboarding
      } else if (action === "REJECT") {
        offer.status = "REJECTED";
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }
  
      offer.updatedBy = updatedBy;
      await offer.save();
  
      res.status(200).json({ message: `Offer status updated to ${offer.status}`, offer });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  // Function gửi email onboarding khi offer được chấp nhận
  function sendOnboardingEmail(offer) {
    console.log(`📩 Sending onboarding email for accepted offer ID: ${offer._id}`);
  }
