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

exports.generateTempPassword = () => {
  return Math.random().toString(36).slice(-8); // Example: "xA1b2c3d"
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

exports.sendTempPasswordToUser = async (name, email) => {
  try {
    const tempPassword = this.generateTempPassword();

    const htmlContent = `
      <h2>Mật khẩu tạm thời của bạn</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Hệ thống đã khởi tạo lại mật khẩu của bạn. Vui lòng đăng nhập bằng mật khẩu tạm thời sau:</p>
      <p><strong>${tempPassword}</strong></p>
      <p>Vui lòng đổi mật khẩu ngay sau khi đăng nhập.</p>
      <p>Cảm ơn bạn!</p>
    `;

    await this.sendEmail(email, "Mật khẩu tạm thời của bạn", htmlContent);

    return {
      success: true,
      message: "Mật khẩu tạm thời đã gửi thành công",
      tempPassword,
    };
  } catch (error) {
    return { success: false, message: error };
  }
};

exports.sendInterviewEmailToCandidate = async (
  candidate,
  position,
  deadline
) => {
  try {
    const htmlContent = `
      <div>
        <h3>Chào ${candidate.name},</h3>
        <p>Chúng tôi rất vui khi nhận được hồ sơ ứng tuyển của bạn cho vị trí <strong>${position}</strong> tại <strong>Công ty CareerShift</strong>.</p>
        <p>Sau khi xem xét hồ sơ, chúng tôi muốn mời bạn tham gia phỏng vấn cho vị trí này.</p>
        <p>Vui lòng xác nhận tham gia phỏng vấn bằng cách phản hồi email này <strong>trước ${deadline}</strong>.</p>
        <p><strong>Lưu ý:</strong> Nếu chúng tôi không nhận được phản hồi từ bạn trước thời hạn trên, chúng tôi sẽ mặc định rằng bạn từ chối lời mời phỏng vấn.</p>
        <p>Sau khi bạn xác nhận, chúng tôi sẽ gửi thông tin chi tiết về lịch trình và hình thức phỏng vấn.</p>
        <p>Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi qua email <strong>carrershift@gmail.com</strong> hoặc số điện thoại <strong>0123456789</strong>.</p>
        <p>Chúng tôi mong sớm nhận được phản hồi từ bạn!</p>
        <p>Trân trọng,</p>
        <p><strong>Công ty CareerShift</strong></p>
      </div>
    `;

    await this.sendEmail(
      candidate.email,
      `Lời mời xác nhận phỏng vấn vị trí ${position}`,
      htmlContent
    );
    return {
      success: true,
      message: "Gửi lời mời phỏng vấn thành công",
    };
  } catch (error) {
    return { success: false, message: error };
  }
};
