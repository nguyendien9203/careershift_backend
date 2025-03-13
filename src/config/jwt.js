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
