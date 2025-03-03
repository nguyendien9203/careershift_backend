const sendEmail = require("../config/mailer");
// const { getCandidatepassedinterview } = require("./interviewController");
const { fetchCandidatesPassedInterview } = require("./interviewController");

exports.sendEmailToCandidates = async (req, res) => {
    try {
        // Lấy danh sách ứng viên đã trúng tuyển
      // Lấy danh sách ứng viên đã trúng tuyển
      const candidates = await fetchCandidatesPassedInterview();

      if (!candidates || candidates.length === 0) {
          return res.status(200).json({ message: "Không có ứng viên nào để gửi email." });
      }

      // Gửi email cho từng ứng viên
      await Promise.all(candidates.map(sendEmail));

      return res.status(200).json({ message: "Email đã được gửi thành công!" });

  } catch (error) {
      console.error("❌ Lỗi khi gửi email:", error);
      return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};