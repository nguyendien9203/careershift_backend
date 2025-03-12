const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");

exports.hasPermission = (requiredPermissions) => {
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
          populate: {
            path: "permissions",
            select: "name -_id",
          },
        })
        .exec();

      const permissions = user.roles.permissions.map((perm) => perm.name);

      if (!user || !permissions.length) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Bạn không có quyền thực hiện thao tác này" });
      }

      const hasRequiredPermission = permissions.some((perm) =>
        requiredPermissions.includes(perm)
      );

      if (!hasRequiredPermission) {
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
