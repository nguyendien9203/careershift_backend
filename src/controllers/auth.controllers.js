const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../config/redis");
const { sendOTPToUser } = require("../config/email");
const { generateAccessToken, generateRefreshToken } = require("../config/jwt");
const UserStatus = require("../utils");
const User = require("../models/user.model");

// Helper login failed
const handleFailedLogin = async (user) => {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= 5) {
    user.status = UserStatus.LOCKED;
    user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15m
  }
  await user.save();
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Tài khoản không tồn tại",
      });
    }

    if (!user.verified) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message:
          "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để nhận mã OTP",
      });
    }

    if (user.status === UserStatus.LOCKED && !user.lockedUntil) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Tài khoản bị vô hiệu hóa",
      });
    }

    if (
      user.status === UserStatus.LOCKED &&
      user.lockedUntil &&
      user.lockedUntil > Date.now()
    ) {
      return res.status(StatusCodes.LOCKED).json({
        message: `Tài khoản bị khóa tạm thời. Vui lòng thử lại sau ${Math.ceil(
          (user.lockedUntil - Date.now()) / 60000
        )} phút`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await handleFailedLogin(user);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Mật khẩu không chính xác",
      });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      message: "Đăng nhập thành công",
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi server",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Refresh token không hợp lệ, vui lòng đăng nhập lại",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const storedToken = await redis.get(`refreshToken:${decoded.id}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Refresh token không hợp lệ",
      });
    }

    const newAccessToken = await generateAccessToken({ _id: decoded.id });
    return res.status(StatusCodes.OK).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Refresh token hết hạn" });
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server" });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Tài khoản không tồn tại",
      });
    }

    if (user.verified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Tài khoản đã xác thực",
      });
    }

    const result = await sendOTPToUser(user);

    if (result.success) {
      return res.status(StatusCodes.OK).json({ message: result.message });
    } else {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: result.message });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Người dùng không tồn tại",
      });
    }

    const storedOTP = await redis.get(`otp:${email}`);

    if (!storedOTP) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "OTP đã hết hạn, vui lòng yêu cầu lại",
      });
    }

    if (storedOTP !== otp) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "OTP không hợp lệ" });
    }

    await redis.del(`otp:${email}`);

    user.verified = true;
    await user.save();

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1d
    });

    return res.status(StatusCodes.OK).json({
      message: "Xác thực thành công",
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server" });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    await redis.del(`refreshToken:${userId}`);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(StatusCodes.OK).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server" });
  }
};
