const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
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

exports.authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Bạn chưa đăng nhập" });
    }

    try {
      const user = await User.findById(req.user.id)
        .populate({
          path: "roles",
          select: "name -_id",
        })
        .select("roles")
        .exec();

      if (!user || !user.roles) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Bạn không có quyền thực hiện thao tác này" });
      }

      if (!allowedRoles.includes(user.roles.name)) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Bạn không có quyền thực hiện thao tác này" });
      }

      next();
    } catch (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };
};
