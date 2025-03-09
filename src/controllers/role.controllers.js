const { StatusCodes } = require("http-status-codes");
const Role = require("../models/role.model");

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");
    res.status(StatusCodes.OK).json(roles);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

exports.getPermissionByRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).select("permissions");

    if (!role)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Role not found" });

    const result = role.permissions.map((perm) => perm.toString());

    res.status(StatusCodes.OK).json({
      roleId: req.params.roleId,
      permissions: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi lấy danh sách quyền hạn theo vai trò.",
      error: error.message,
    });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const id = req.params.id;
    const { permissions } = req.body;

    console.log(req.params.id, id, permissions);

    if (!Array.isArray(permissions))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Danh sách quyền hạn không hợp lệ" });

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    );

    if (!updatedRole) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Vai trò không tồn tại" });
    }

    res.status(StatusCodes.OK).json({
      message: "Quyền hạn của vài trò đã được cập nhật thành công",
      roleId: id,
      updatedPermissions: updatedRole.permissions,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server.", error: error.message });
  }
};
