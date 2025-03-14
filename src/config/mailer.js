require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email gửi
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
  },
});
const sendOnboardingEmail = async (candidate, offer) => {
  try {
    if (!candidate || !candidate.email) {
      throw new Error("Candidate email is missing or undefined.");
    }

    const { job, contractType, startDate, salary, department, manager } = offer;
    const formattedSalary = Number(salary).toLocaleString("vi-VN");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: `Chào mừng ${candidate.name} - Hợp đồng lao động tại Công ty ABC`,
      text: `Xin chào ${candidate.name},\n\n
Chúc mừng bạn đã chính thức trở thành nhân viên của Công ty ABC với vị trí ${job}. Dưới đây là thông tin chi tiết về hợp đồng:\n
- Loại hợp đồng: ${contractType}
- Ngày bắt đầu: ${startDate}
- Mức lương: ${formattedSalary} VND/tháng
- Bộ phận: ${candidate.job}
- Quản lý trực tiếp: ${manager}\n
Để hoàn tất quá trình onboard, vui lòng chuẩn bị các giấy tờ cần thiết và gửi về phòng nhân sự trước ngày làm việc đầu tiên.\n
Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua email hoặc hotline HR.\n
Chúng tôi rất mong được chào đón bạn tại Công ty ABC!\n\n
Trân trọng,\n
Phòng Nhân Sự - Công ty ABC`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email onboarding đã gửi đến: ${candidate.email}`);
  } catch (error) {
    console.error(`❌ Lỗi khi gửi email onboarding đến ${candidate?.email || "undefined"}:`, error);
    throw error;
  }
};

module.exports = { sendOnboardingEmail };
