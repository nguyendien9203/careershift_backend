const nodemailer = require('nodemailer');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Recruitment = require('../models/Recruitment');
const mongoose = require('mongoose');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Gửi thư mời phỏng vấn
const sendInterviewInvitation = async (req, res) => {
    try {
        const { interviewId } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!interviewId) {
            return res.status(400).json({
                success: false,
                message: 'Interview ID is required'
            });
        }

        // Validate interviewId format
        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ success: false, message: "Invalid interview ID format" });
        }

        // Tìm thông tin phỏng vấn
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Lấy candidateId từ recruitmentId
        const recruitment = await Recruitment.findById(interview.recruitmentId);
        if (!recruitment || !recruitment.candidateId) {
            return res.status(404).json({
                success: false,
                message: 'Recruitment or Candidate not found'
            });
        }

        // Tìm thông tin ứng viên
        const candidate = await Candidate.findById(recruitment.candidateId);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Tạo nội dung email
        const interviewDate = new Date(interview.date).toLocaleDateString('vi-VN');
        const mailOptions = {
            from: `"[Tên Công Ty]" <${process.env.EMAIL_USER}>`,
            to: candidate.email,
            subject: 'Thư mời phỏng vấn từ [Tên Công Ty]',
            html: `
                <h2>Thư mời phỏng vấn</h2>
                <p>Kính gửi ${candidate.name},</p>
                <p>Chúng tôi rất vui mừng thông báo rằng bạn đã được mời tham gia phỏng vấn tại [Tên Công Ty]. Dưới đây là thông tin chi tiết:</p>
                <ul>
                    <li><strong>Ngày phỏng vấn:</strong> ${interviewDate}</li>
                    <li><strong>Thời gian:</strong> ${interview.time}</li>
                    <li><strong>Hình thức:</strong> ${interview.mode === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}</li>
                    ${interview.mode === 'ONLINE' ?
                        `<li><strong>Link Google Meet:</strong> <a href="${interview.google_meet_link}">${interview.google_meet_link}</a></li>` :
                        `<li><strong>Địa chỉ:</strong> ${interview.address || 'N/A'}</li>`
                    }
                </ul>
                <p>Vui lòng xác nhận tham gia bằng cách trả lời email này.</p>
                <p>Trân trọng,<br>[Tên Công Ty]</p>
            `
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Interview invitation sent successfully'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send interview invitation',
            error: error.message
        });
    }
};

// Hủy lịch phỏng vấn
const cancelInterview = async (req, res) => {
    try {
        const { interviewId } = req.params; // Lấy interviewId từ route params

        // Validate interviewId format
        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ success: false, message: "Invalid interview ID format" });
        }

        // Tìm thông tin phỏng vấn
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Lấy candidateId từ recruitmentId
        const recruitment = await Recruitment.findById(interview.recruitmentId);
        if (!recruitment || !recruitment.candidateId) {
            return res.status(404).json({
                success: false,
                message: 'Recruitment or Candidate not found'
            });
        }

        // Tìm thông tin ứng viên
        const candidate = await Candidate.findById(recruitment.candidateId);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Kiểm tra trạng thái hiện tại để tránh hủy lại
        if (interview.finalStatus === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: 'Interview is already cancelled'
            });
        }

        // Cập nhật finalStatus thành CANCELLED
        interview.finalStatus = "CANCELLED";
        interview.updatedBy = req.user?._id;
        await interview.save();

        // Tạo nội dung email thông báo hủy
        const interviewDate = new Date(interview.date).toLocaleDateString('vi-VN');
        const mailOptions = {
            from: `"[Tên Công Ty]" <${process.env.EMAIL_USER}>`,
            to: candidate.email,
            subject: 'Thông báo hủy lịch phỏng vấn từ [Tên Công Ty]',
            html: `
                <h2>Thông báo hủy lịch phỏng vấn</h2>
                <p>Kính gửi ${candidate.name},</p>
                <p>Chúng tôi rất tiếc phải thông báo rằng lịch phỏng vấn của bạn tại [Tên Công Ty] đã bị hủy. Dưới đây là thông tin chi tiết:</p>
                <ul>
                    <li><strong>Ngày phỏng vấn:</strong> ${interviewDate}</li>
                    <li><strong>Thời gian:</strong> ${interview.time}</li>
                    <li><strong>Hình thức:</strong> ${interview.mode === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}</li>
                </ul>
                <p>Lý do hủy: [Lý do nếu có, hoặc để trống]. Chúng tôi rất tiếc vì sự bất tiện này.</p>
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
                <p>Trân trọng,<br>[Tên Công Ty]</p>
            `
        };

        // Gửi email thông báo hủy
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Interview cancelled successfully and notification sent to candidate'
        });

    } catch (error) {
        console.error('Error cancelling interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel interview or send notification',
            error: error.message
        });
    }
};

module.exports = { sendInterviewInvitation, cancelInterview };