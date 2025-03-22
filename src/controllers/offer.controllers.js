const mongoose = require("mongoose");

const Offer = require("../models/offer.model");
const Recruitment = require("../models/recruitment.model");
const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");
const candidateComparisonModel = require("../models/candidate-comparison.model");
const {
  sendSalaryProposalEmail,
  sendOnboardingEmail,
} = require("../config/mailer");


//tạo offer
exports.createOffer = async (req, res) => {
  try {
    // 1. Lấy candidateId và thông tin offer từ request
    const { candidateId } = req.params;
    const { baseSalary, salary, bonus, note } = req.body;

    const objectIdCandidateId = new mongoose.Types.ObjectId(candidateId);

    // 2. Kiểm tra ứng viên có trong CandidateComparison không
    const candidateComparison = await candidateComparisonModel.findOne({
      selectedCandidateId: objectIdCandidateId,
    });
    if (!candidateComparison) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên trúng tuyển." });
    }

    // 3. Tìm Recruitment theo candidateId và jobId
    const recruitment = await Recruitment.findOne({
      candidateId: objectIdCandidateId,
      jobId: candidateComparison.jobId,
    });
    if (!recruitment) {
      return res.status(404).json({ message: "Không tìm thấy thông tin tuyển dụng." });
    }

    const recruitmentId = recruitment._id;
    const jobTitle = recruitment.jobTitle; // Lấy jobTitle từ Recruitment

    // 4. Tạo offer mới
    const newOffer = new Offer({
      baseSalary,
      salary,
      bonus,
      note,
      status: "PENDING",
      recruitmentId,
    });

    await newOffer.save();
    console.log("✅ Offer đã được tạo thành công:", newOffer);

    // 5. Lấy thông tin ứng viên để gửi email
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy thông tin ứng viên." });
    }

    // 6. Gọi hàm sendSalaryProposalEmail để gửi email
    await sendSalaryProposalEmail(candidate, newOffer, jobTitle);
    console.log(`✅ Đã gửi email offer cho: ${candidate.email}`);

    // 7. Phản hồi thành công
    res.status(201).json({
      message: "Tạo offer thành công và đã gửi email cho ứng viên.",
      offer: newOffer,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo offer và gửi email:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
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
        return res.status(400).json({
          message:
            "Negotiated salary must be greater than or equal to base salary",
        });
      }
      if (negotiatedSalary > offer.salary * 1.15) {
        return res.status(400).json({
          message:
            "Negotiated salary must not exceed 115% of the original salary",
        });
      }
      offer.negotiatedSalary = negotiatedSalary;
      offer.approvalRequired = true; // Cần duyệt từ manager
      offer.status = "PENDING"; // Chuyển trạng thái chờ duyệt
    }

    offer.updatedBy = updatedBy;
    await offer.save();
    res
      .status(200)
      .json({ message: "Offer updated, pending manager approval", offer });
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
    const recruitmentData = await Recruitment.findById(
      offer.recruitmentId
    ).lean();
    console.log(" Dữ liệu tuyển dụng:", recruitmentData);

    if (!recruitmentData) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin tuyển dụng." });
    }

    if (!recruitmentData.candidateId) {
      console.log(" Lỗi: recruitmentData.candidateId bị undefined!");
      return res
        .status(400)
        .json({ message: "Dữ liệu tuyển dụng không có candidateId." });
    }

    // Lấy danh sách ứng viên đã vượt phỏng vấn
    const candidates = await getCompletedComparisons();
    console.log(" Danh sách ứng viên vượt phỏng vấn:", candidates);

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh sách ứng viên." });
    }

    // Tìm ứng viên trong danh sách đã vượt phỏng vấn
    const candidate = candidates.find(
      (c) => c._id?.toString() === recruitmentData.candidateId?.toString()
    );

    if (!candidate) {
      console.log(" Không tìm thấy ứng viên trong danh sách!", {
        candidateId: recruitmentData.candidateId,
      });
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

    res
      .status(200)
      .json({ message: `Offer ${action} by manager and email sent`, offer });
  } catch (error) {
    console.error(" Lỗi khi duyệt offer:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
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
      return res
        .status(400)
        .json({ message: "Offer is not in a valid state for HR update" });
    }

    // Lấy thông tin recruitment để xác định candidate
    const recruitmentData = await Recruitment.findById(
      offer.recruitmentId
    ).lean();
    if (!recruitmentData || !recruitmentData.candidateId) {
      return res
        .status(404)
        .json({ message: "Recruitment data not found or missing candidateId" });
    }

    // Lấy danh sách ứng viên đã vượt phỏng vấn
    const candidates = await getCompletedComparisons();
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found" });
    }

    // Tìm ứng viên trong danh sách
    const candidate = candidates.find(
      (c) => c._id?.toString() === recruitmentData.candidateId?.toString()
    );
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

    res
      .status(200)
      .json({ message: `Offer status updated to ${offer.status}`, offer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
