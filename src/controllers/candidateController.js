const sendMail = require("../config/mailer");
const Candidate = require("../models /Candidate");

exports.sendInterviewEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (candidate.status.trim().toUpperCase() !== "AVAILABLE") {
      return res.status(400).json({
        message: `Candidate has status: ${candidate.status}. Cannot send email.`,
      });
    }

    const emailContent = `
      <div style="text-align: center; font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h3>Chào ${candidate.name},</h3>
    <p>Chúng tôi rất vui khi nhận được hồ sơ của bạn ứng tuyển tại <strong>Công ty CareerShift</strong>. Sau khi xem xét hồ sơ, chúng tôi muốn mời bạn tham gia phỏng vấn.</p>
    <p>Vui lòng xác nhận tham gia phỏng vấn bằng cách phản hồi email này <strong>trước 00:00 ngày 09/03/2025</strong>.</p>
    <p><strong>Lưu ý:</strong> Nếu chúng tôi không nhận được phản hồi từ bạn trước thời hạn trên, chúng tôi sẽ mặc định rằng bạn từ chối lời mời phỏng vấn.</p>
    <p>Sau khi bạn xác nhận, chúng tôi sẽ gửi thông tin chi tiết về lịch trình và hình thức phỏng vấn.</p>
    <p>Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi qua email <strong>carrershift@gmail.com</strong> hoặc số điện thoại <strong>0123456789</strong>.</p>
    <p>Chúng tôi mong sớm nhận được phản hồi từ bạn!</p>
    <p>Trân trọng,</p>
    <p><strong>Công ty CareerShift</strong></p>
    </div>
    `;

    await sendMail(email, "Lời mời xác nhận phỏng vấn", emailContent);
    return res.json({ message: "Email sent sucessfully!" });
  } catch (error) {
    console.error("Error send email:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { email, status } = req.body;
    if (!email || !status) {
      return res
        .status(400)
        .json({ message: "Email and status are required." });
    }
    // Kiểm tra status hợp lệ
    const validStatuses = ["AVAILABLE", "HIRED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    if (candidate.status === "HIRED" || candidate.status === "REJECTED") {
      return res
        .status(400)
        .json({ message: "Candidate status is already final." });
    }
    candidate.status = status;

    await candidate.save();

    return res
      .status(200)
      .json({ message: `Candidate status updated to ${status}` });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
