const nodemailer = require("nodemailer");
const redis = require("./redis");
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

exports.generateOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${email}`, otp, "EX", 120); //2m
  return otp;
};

exports.sendOTPToUser = async (user) => {
  try {
    const otp = await this.generateOTP(user.email);

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
