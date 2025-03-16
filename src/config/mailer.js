require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email gửi
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
  },
});


const sendEmail = async ({ name, email, jobTitle }) => {
  try {
      if (!email || !name || !jobTitle) {
          console.error(` Thiếu thông tin khi gửi email: ${JSON.stringify({ name, email, jobTitle })}`);
          return;
      }

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Thông báo trúng tuyển",
          text: `Xin chào ${name},\n\nChúc mừng bạn đã trúng tuyển vào vị trí **${jobTitle}**!\nVui lòng liên hệ lại với chúng tôi để hoàn tất thủ tục.\n\nTrân trọng,\nCông ty ABC`
      };

      await transporter.sendMail(mailOptions);
      console.log(` Email đã gửi đến: ${email} - Công việc: ${jobTitle}`);
  } catch (error) {
      console.error(` Lỗi khi gửi email đến ${email}:`, error);
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
    console.log(` Đề xuất lương đã gửi đến: ${candidate.email}`);
  } catch (error) {
    console.error(` Lỗi khi gửi đề xuất lương đến ${candidate.email}:`, error);
    throw error;
  }
};

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
- Bộ phận: ${department}
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


module.exports = { sendEmail, sendSalaryProposalEmail, sendOnboardingEmail };
