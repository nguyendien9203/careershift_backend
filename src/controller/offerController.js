const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const Recruitment = require("../models/Recruitment");
const { fetchCandidatesPassedInterview } = require("./interviewController");
const { sendSalaryProposalEmail, sendOnboardingEmail } = require("../config/mailer");
const Candidate = require("../models/Candidate");

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