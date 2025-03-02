const nodemailer = require("nodemailer");
const { getMaxListeners } = require("../app");
require("dotenv").config();
const sendInterviewEmail = async (candidateEmail, candidateName, jobTitle, date, time, mode, googleMeetLink, address) => {
  try {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      

    const mailOptions = {
      from:"hieunmhe170295@fpt.edu.vn" ,
      to: "nguyenminhhieu2003hd@gmail.com",
      subject: `Thư mời phỏng vấn - ${jobTitle}`,
      html: `
        <p>Chào ${candidateName},</p>
        <p>Bạn đã được mời tham gia phỏng vấn cho vị trí <strong>${jobTitle}</strong>.</p>
        <p><strong>Thời gian:</strong> ${date} lúc ${time}</p>
        <p><strong>Hình thức:</strong> ${mode}</p>
        ${mode === "Online" ? `<p><strong>Link Google Meet:</strong> <a href="${googleMeetLink}">${googleMeetLink}</a></p>` : ""}
        ${mode === "Offline" ? `<p><strong>Địa chỉ:</strong> ${address}</p>` : ""}
        <p>Vui lòng kiểm tra và phản hồi nếu bạn có bất kỳ câu hỏi nào.</p>
        <p>Trân trọng,</p>
        <p>HR Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(` Email đã gửi thành công đến: ${candidateEmail}`);
  } catch (error) {
    console.error(" Lỗi khi gửi email:", error);
  }
};

module.exports = { sendInterviewEmail };
