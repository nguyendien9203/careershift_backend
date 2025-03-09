const { StatusCodes } = require("http-status-codes");
const Permission = require("../models/permission.model");

exports.getPermissionsByCategory = async (req, res) => {
  try {
    const permissions = await Permission.find().lean();

    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }

      acc[perm.category].push({
        id: perm._id,
        name: perm.name,
        description: perm.description,
      });

      return acc;
    }, {});

    const result = Object.keys(groupedPermissions).map((category) => ({
      category,
      permissions: groupedPermissions[category],
    }));

    res.status(StatusCodes.OK).json({
      data: result,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi khi lấy danh sách quyền hạn.", error });
  }
};
