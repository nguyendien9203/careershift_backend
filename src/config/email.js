const nodemailer = require("nodemailer");
const OTP = require("../models/otp.model");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {string} to - Email recipient.
 * @param {string} subject - Email subject.
 * @param {string} htmlContent - Email content.
 */
exports.sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Gửi email thất bại");
  }
};

exports.sendOTPToUser = async (user) => {
  try {
    await OTP.deleteMany({ userId: user._id });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await OTP.create({ userId: user._id, value: otp, expiresAt: expiresAt });

    const htmlContent = `
      <h2>Xác thực tài khoản</h2>
      <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
      <p>OTP có hiệu lực trong 2 phút.</p>
    `;

    await this.sendEmail(user.email, "Xác thực tài khoản", htmlContent);

    return { success: true, message: "OTP đã được gửi thành công" };
  } catch (error) {
    return { success: false, message: error };
  }
};
