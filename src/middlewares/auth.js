const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Không có quyền truy cập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access token hết hạn" });
    }
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Access token không hợp lệ" });
  }
};
