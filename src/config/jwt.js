const jwt = require("jsonwebtoken");
const redis = require("./redis");

exports.generateAccessToken = async (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

exports.generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  await redis.set(`refreshToken:${user._id}`, refreshToken, "EX", 24 * 60 * 60); //1d
  return refreshToken;
};

exports.invalidateUserTokens = async (userId) => {
  await redis.del(`refreshToken:${userId}`);
};

exports.blacklistAccessToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp * 1000 - Date.now();

    if (expiresIn > 0) {
      await redis.set(
        `blacklist:${token}`,
        "invalid",
        "EX",
        Math.floor(expiresIn / 1000)
      );
      console.log(`AccessToken bị vô hiệu hóa: ${token}`);
    }
  } catch (error) {
    console.error("Lỗi khi blacklist token:", error);
  }
};
