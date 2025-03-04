const { sendEmail, sendOTPToUser } = require("../config/email");
const { generateToken } = require("../config/jwt");
const OTP = require("../models/otp.model");
const User = require("../models/user.model");
const passport = require("../config/passport");

exports.login = async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!user) {
      if (info.status === 400) {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
          const result = await sendOTPToUser(user);
          console.log(result);
          return res.status(400).json({ message: result.message });
        }
      }
      return res.status(400).json({ message: info.message });
    }

    const token = await generateToken(user);

    return res
      .status(200)
      .json({ status: 200, message: "Đăng nhập thành công", token });
  })(req, res, next);
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Email không tồn tại " });
    if (user.verified)
      return res.status(400).json({ message: "Tài khoản đã xác thực" });

    const result = await sendOTPToUser(user);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const otpRecord = await OTP.findOne({ userId: user._id });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP không hợp lệ" });

    if (otpRecord.expiresAt < Date.now()) {
      await OTP.deleteMany({ userId: user._id });
      return res
        .status(400)
        .json({ message: "OTP đã hết hạn, vui lòng yêu cầu lại" });
    }

    if (otpRecord.value !== Number(otp))
      return res
        .status(400)
        .json({ message: "OTP không đúng, vui lòng kiểm tra lại" });

    user.verified = true;
    await user.save();
    await OTP.deleteMany({ userId: user._id });

    const token = await generateToken(user);

    return res
      .status(200)
      .json({ status: 200, message: "Xác thực thành công", token });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};
