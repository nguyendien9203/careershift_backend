const nodemailer = require('nodemailer');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendInterviewInvitation = async (req, res) => {
    try {
        const { interviewId, candidateId } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!interviewId || !candidateId) {
            return res.status(400).json({
                success: false,
                message: 'Interview ID and Candidate ID are required'
            });
        }

        // Tìm thông tin phỏng vấn và ứng viên
        const interview = await Interview.findById(interviewId);
        const candidate = await Candidate.findById(candidateId);

        if (!interview || !candidate) {
            return res.status(404).json({
                success: false,
                message: 'Interview or Candidate not found'
            });
        }

        // Tạo nội dung email
        const interviewDate = new Date(interview.date).toLocaleDateString('vi-VN');
        const mailOptions = {
            from: `"[Tên Công Ty]" <${process.env.EMAIL_USER}>`, // Không cần tên người dùng
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

module.exports = { sendInterviewInvitation };