require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email gửi
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
  },
});

const sendMail = async (to, subject, text) => {
    try {
      const info = await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
      });
      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email sending failed'); // Thêm dòng này để lỗi được bắt đúng cách
    }
  };

module.exports = sendMail;
