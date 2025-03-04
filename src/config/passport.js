const { Strategy: LocalStrategy } = require("passport-local");
const passport = require("passport");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const UserStatus = require("../utils");
require("dotenv").config();

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user)
          return done(null, false, {
            status: 404,
            message: "Tài khoản không tồn tại",
          });

        if (!user.verified)
          return done(null, false, {
            status: 400,
            message:
              "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để nhận mã OTP.",
          });

        if (user.status === UserStatus.LOCKED && !user.lockedUntil) {
          return done(null, false, {
            status: 403,
            message: "Tài khoản đã bị vô hiệu hóa",
          });
        }

        if (
          user.status === UserStatus.LOCKED &&
          user.lockedUntil &&
          user.lockedUntil > Date.now()
        ) {
          return done(null, false, {
            status: 403,
            message: `Tài khoản bị khóa tạm thời. Vui lòng thử lại sau ${Math.ceil(
              (user.lockedUntil - Date.now()) / 60000
            )} phút`,
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          user.failedLoginAttempts += 1;

          if (user.failedLoginAttempts >= 5) {
            user.status = UserStatus.LOCKED;
            user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          }

          await user.save();
          return done(null, false, {
            status: 401,
            message: "Mật khẩu không chính xác",
          });
        }

        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
