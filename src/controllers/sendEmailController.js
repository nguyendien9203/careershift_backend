const nodemailer = require("nodemailer");
const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");

const Job = require("../models/job.model");
const Recruitment = require("../models/recruitment.model");

const User = require("../models/user.model");

const mongoose = require("mongoose");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Gửi thư mời phỏng vấn
const sendInterviewInvitation = async (req, res) => {
  try {
    const { interviewId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    // Validate interviewId format
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview ID format" });
    }

    // Tìm thông tin phỏng vấn
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Lấy candidateId từ recruitmentId
    const recruitment = await Recruitment.findById(interview.recruitmentId);
    if (!recruitment || !recruitment.candidateId) {
      return res.status(404).json({
        success: false,
        message: "Recruitment or Candidate not found",
      });
    }

    // Tìm thông tin ứng viên
    const candidate = await Candidate.findById(recruitment.candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Tạo nội dung email
    const interviewDate = new Date(interview.date).toLocaleDateString("vi-VN");
    const mailOptions = {
      from: `"[Tên Công Ty]" <${process.env.EMAIL_USER}>`,
      to: candidate.email,
      subject: "Thư mời phỏng vấn từ  Công Ty",
      html: `
                <h2>Thư mời phỏng vấn</h2>
                <p>Kính gửi ${candidate.name},</p>
                <p>Chúng tôi rất vui mừng thông báo rằng bạn đã được mời tham gia phỏng vấn tại  Công Ty. Dưới đây là thông tin chi tiết:</p>
                <ul>
                    <li><strong>Ngày phỏng vấn:</strong> ${interviewDate}</li>
                    <li><strong>Thời gian:</strong> ${interview.time}</li>
                    <li><strong>Hình thức:</strong> ${
                      interview.mode === "ONLINE" ? "Trực tuyến" : "Trực tiếp"
                    }</li>
                    ${
                      interview.mode === "ONLINE"
                        ? `<li><strong>Link Google Meet:</strong> <a href="${interview.google_meet_link}">${interview.google_meet_link}</a></li>`
                        : `<li><strong>Địa chỉ:</strong> ${
                            interview.address || "N/A"
                          }</li>`
                    }
                </ul>
                <p>Vui lòng xác nhận tham gia bằng cách trả lời email này.</p>
                <p>Trân trọng,<br>Công ty</p>
            `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Interview invitation sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send interview invitation",
      error: error.message,
    });
  }
};

// Hủy lịch phỏng vấn
const cancelInterview = async (req, res) => {
  try {
    const { interviewId } = req.params; // Lấy interviewId từ route params

    // Validate interviewId format
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview ID format" });
    }

    // Tìm thông tin phỏng vấn
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Lấy candidateId từ recruitmentId
    const recruitment = await Recruitment.findById(interview.recruitmentId);
    if (!recruitment || !recruitment.candidateId) {
      return res.status(404).json({
        success: false,
        message: "Recruitment or Candidate not found",
      });
    }

    // Tìm thông tin ứng viên
    const candidate = await Candidate.findById(recruitment.candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Kiểm tra trạng thái hiện tại để tránh hủy lại
    if (interview.finalStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Interview is already cancelled",
      });
    }

    // Cập nhật finalStatus thành CANCELLED
    interview.finalStatus = "CANCELLED";
    interview.updatedBy = req.user?._id;
    await interview.save();

    // Tạo nội dung email thông báo hủy
    const interviewDate = new Date(interview.date).toLocaleDateString("vi-VN");
    const mailOptions = {
      from: `"[Tên Công Ty]" <${process.env.EMAIL_USER}>`,
      to: candidate.email,
      subject: "Thông báo hủy lịch phỏng vấn từ công ty",
      html: `
                <h2>Thông báo hủy lịch phỏng vấn</h2>
                <p>Kính gửi ${candidate.name},</p>
                <p>Chúng tôi rất tiếc phải thông báo rằng lịch phỏng vấn của bạn tại Công Ty đã bị hủy. Dưới đây là thông tin chi tiết:</p>
                <ul>
                    <li><strong>Ngày phỏng vấn:</strong> ${interviewDate}</li>
                    <li><strong>Thời gian:</strong> ${interview.time}</li>
                    <li><strong>Hình thức:</strong> ${
                      interview.mode === "ONLINE" ? "Trực tuyến" : "Trực tiếp"
                    }</li>
                </ul>
                <p>Lý do hủy: [Lý do nếu có, hoặc để trống]. Chúng tôi rất tiếc vì sự bất tiện này.</p>
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
                <p>Trân trọng,<br>CÔng ty</p>
            `,
    };

    // Gửi email thông báo hủy
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message:
        "Interview cancelled successfully and notification sent to candidate",
    });
  } catch (error) {
    console.error("Error cancelling interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel interview or send notification",
      error: error.message,
    });
  }
};




const createInterviewStage = async (req, res) => {
  try {
    const { interviewId, round, type, interviewerIds } = req.body;

    // Validate interviewId format
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng ID phỏng vấn không hợp lệ",
      });
    }

    // Check if interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy phỏng vấn với ID: ${interviewId}`,
      });
    }

    // Validate required fields
    if (
      !round ||
      !type ||
      !Array.isArray(interviewerIds) ||
      interviewerIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Round, type và interviewerIds là bắt buộc",
      });
    }

    // Validate round number
    if (round < 1) {
      return res.status(400).json({
        success: false,
        message: "Số vòng phải lớn hơn hoặc bằng 1",
      });
    }

    // Check if stage with same round already exists
    const existingStage = interview.stages.find(
      (stage) => stage.round === round
    );
    if (existingStage) {
      return res.status(400).json({
        success: false,
        message: `Vòng ${round} đã tồn tại`,
      });
    }

    // Validate interview type
    const validTypes = [
      "HR_SCREENING",
      "TECHNICAL_INTERVIEW",
      "FINAL_INTERVIEW",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Loại phỏng vấn không hợp lệ. Phải là một trong: HR_SCREENING, TECHNICAL_INTERVIEW, FINAL_INTERVIEW",
      });
    }

    // Validate interviewerIds and get their details
    const interviewers = await User.find({ _id: { $in: interviewerIds } });
    if (interviewers.length !== interviewerIds.length) {
      return res.status(400).json({
        success: false,
        message: "Một hoặc nhiều ID người phỏng vấn không hợp lệ",
      });
    }

    // Xác định date và time cho stage mới
    let stageDate;
    let stageTime = interview.time; // Mặc định lấy time từ interview

    if (round === 1) {
      stageDate = new Date(interview.date);
    } else {
      const previousStage = interview.stages.find(
        (stage) => stage.round === round - 1
      );
      if (!previousStage) {
        return res.status(400).json({
          success: false,
          message: `Vòng ${round - 1} phải tồn tại trước khi tạo vòng ${round}`,
        });
      }
      stageDate = new Date(previousStage.date);
      stageDate.setDate(stageDate.getDate() + 1); // Cộng thêm 1 ngày
    }

    // Create new stage với date và time
    const newStage = {
      round,
      type,
      interviewerIds,
      status: "SCHEDULED",
      evaluations: [],
      date: stageDate,
      time: stageTime,
    };

    // Add stage to interview
    interview.stages.push(newStage);
    await interview.save();

    // Chuẩn bị danh sách tên người phỏng vấn để hiển thị trong email
    const interviewerNames = interviewers
      .map((interviewer) => interviewer.name || interviewer.email)
      .join(", ");

    // Gửi email thông báo đến từng interviewer với đầy đủ thông tin stage
    const interviewDate = stageDate.toLocaleDateString("vi-VN");
    const mailPromises = interviewers.map((interviewer) => {
      const mailOptions = {
        from: `"[Tên Công Ty]" <${process.env.EMAIL_USER}>`,
        to: interviewer.email,
        subject: `Thông báo phân công phỏng vấn vòng ${round} từ [Tên Công Ty]`,
        html: `
          <h2>Thông báo phân công phỏng vấn</h2>
          <p>Kính gửi ${interviewer.name || "Người phỏng vấn"},</p>
          <p>Bạn đã được phân công tham gia phỏng vấn tại [Tên Công Ty]. Dưới đây là thông tin chi tiết về vòng phỏng vấn:</p>
          <ul>
            <li><strong>Vòng phỏng vấn:</strong> ${newStage.round}</li>
            <li><strong>Loại phỏng vấn:</strong> ${newStage.type}</li>
            <li><strong>Danh sách người phỏng vấn:</strong> ${interviewerNames}</li>
            <li><strong>Ngày phỏng vấn:</strong> ${interviewDate}</li>
            <li><strong>Thời gian:</strong> ${newStage.time}</li>
            <li><strong>Trạng thái:</strong> ${newStage.status}</li>
            <li><strong>Hình thức:</strong> ${
              interview.mode === "ONLINE" ? "Trực tuyến" : "Trực tiếp"
            }</li>
            ${
              interview.mode === "ONLINE"
                ? `<li><strong>Link Google Meet:</strong> <a href="${interview.google_meet_link}">${interview.google_meet_link}</a></li>`
                : `<li><strong>Địa chỉ:</strong> ${interview.address || "N/A"}</li>`
            }
          </ul>
          <p>Vui lòng xác nhận tham gia bằng cách trả lời email này hoặc liên hệ với bộ phận nhân sự.</p>
          <p>Trân trọng,<br>[Tên Công Ty]</p>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    // Chờ tất cả email được gửi
    await Promise.all(mailPromises);

    return res.status(201).json({
      success: true,
      message: "Tạo vòng phỏng vấn thành công và đã gửi thông báo đến người phỏng vấn",
      data: newStage,
    });
  } catch (error) {
    console.error("Lỗi khi tạo vòng phỏng vấn hoặc gửi email:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi tạo vòng phỏng vấn hoặc gửi email",
      error: error.message,
    });
  }
};


module.exports = { sendInterviewInvitation, cancelInterview, createInterviewStage };
