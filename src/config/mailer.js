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

const sendSalaryProposalEmail = async (candidate, offer) => {
  try {
    const { baseSalary, negotiatedSalary, salary, bonus, note } = offer;
    const formattedBaseSalary = Number(baseSalary).toLocaleString("vi-VN");
    const formattedSalary = Number(salary).toLocaleString("vi-VN");
    const formattedBonus = bonus ? Number(bonus).toLocaleString("vi-VN") : "Không có";
    const noteText = note ? `\n\nGhi chú: ${note}` : "";

    // Chỉ thêm negotiatedSalary nếu nó tồn tại và khác baseSalary
    let salaryText = `- Mức lương cơ bản: ${formattedBaseSalary} VND/tháng\n- Mức lương cuối cùng: ${formattedSalary} VND/tháng`;
    if (negotiatedSalary && negotiatedSalary !== baseSalary) {
      const formattedNegotiated = Number(negotiatedSalary).toLocaleString("vi-VN");
      salaryText += `\n- Mức lương thương lượng: ${formattedNegotiated} VND/tháng`;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: `Đề xuất mức lương cho vị trí ${candidate.job}`,
      text: `Xin chào ${candidate.name},\n\nChúng tôi rất vui mừng thông báo rằng bạn đã được chọn cho vị trí ${candidate.job}. Sau khi xem xét, chúng tôi đề xuất:\n${salaryText}\n- Thưởng: ${formattedBonus} VND${noteText}\n\nVui lòng phản hồi email này để xác nhận (ACCEPTED) hoặc từ chối (REJECTED) kèm yêu cầu thương lượng nếu có.\n\nTrân trọng,\nCông ty ABC`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Đề xuất lương đã gửi đến: ${candidate.email}`);
  } catch (error) {
    console.error(`❌ Lỗi khi gửi đề xuất lương đến ${candidate.email}:`, error);
    throw error;
  }
};

module.exports = { sendEmail, sendSalaryProposalEmail };
