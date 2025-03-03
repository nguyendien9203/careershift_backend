require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email gửi
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
  },
});

const sendEmail = async (candidate) => {
  try {
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: candidate.email,
          subject: "Thông báo trúng tuyển",
          text: `Xin chào ${candidate.name},\n\nChúc mừng bạn đã trúng tuyển vào vị trí ${candidate.job}!\nVui lòng liên hệ lại với chúng tôi để hoàn tất thủ tục.\n\nTrân trọng,\nCông ty ABC`
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email đã gửi đến: ${candidate.email}`);
  } catch (error) {
      console.error(`❌ Lỗi khi gửi email đến ${candidate.email}:`, error);
  }
};

module.exports = sendEmail;
