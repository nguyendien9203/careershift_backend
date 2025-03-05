require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email đã gửi: ${info.messageId}`);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw new Error("Gửi email thất bại");
  }
};

module.exports = sendMail;
