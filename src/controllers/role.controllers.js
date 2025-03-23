const { StatusCodes } = require("http-status-codes");
const Role = require("../models/role.model");
const Permission = require("../models/permission.model");

exports.getAllRolesForUserAssignment = async (req, res) => {
  try {
    const roles = await Role.find().select("name");
    if (!roles.length) {
      return res
        .status(StatusCodes.NO_CONTENT)
        .json({ message: "Không có vài trò nào trong hệ thống." });
    }

    res.status(StatusCodes.OK).json(roles);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Tên vai trò không được để trống." });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Vai trò đã tồn tại." });
    }

    const newRole = new Role({ name, description, permissions });
    await newRole.save();

    res.status(StatusCodes.CREATED).json({
      message: "Tạo vai trò thành công",
      newRole: newRole,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name && !permissions) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Không có dữ liệu để cập nhật" });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole && existingRole._id.toString() !== req.params.id) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Tên vai trò đã tồn tại" });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true }
    );

    if (!updatedRole)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Vai trò không tồn tại" });

    res.status(StatusCodes.OK).json(updatedRole);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Vai trò không tồn tại." });
    }

    if (role.name.toLowerCase() === "admin") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Không thể xóa vai trò quản trị viên." });
    }

    const isRoleAssigned = await User.findOne({ role: req.params.id });
    if (isRoleAssigned) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Vai trò đang được sử dụng và không thể xóa." });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(StatusCodes.OK).json({ message: "Xóa vai trò thành công" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

exports.getRolesWithPermissions = async (req, res) => {
  try {
    const roles = await Role.find({ name: { $ne: "Admin" } })
      .populate("permissions", "name")
      .lean();

    if (!roles.length)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Không có vai trò nào trong hệ thống (ngoại trừ admin)",
      });

    const permissions = await Permission.find().lean();

    if (!roles.length)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Không có quyền hạn nào trong hệ thống",
      });

    const allPermissions = permissions.reduce((acc, perm) => {
      let category = acc.find((c) => c.category === perm.category);
      if (!category) {
        category = { category: perm.category, permissions: [] };
        acc.push(category);
      }
      category.permissions.push({
        _id: perm._id,
        name: perm.name,
        description: perm.description,
      });
      return acc;
    }, []);

    res.status(StatusCodes.OK).json({
      roles,
      allPermissions,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message,
    });
  }
};

exports.assignPermissionsToRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { permissions } = req.body;

    if (!Array.isArray(permissions) || permissions.length === 0)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Danh sách quyền hạn không hợp lệ" });

    const role = await Role.findById(id);
    if (!role) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Vai trò không tồn tại" });
    }

    const existingPermissions = role.permissions.map((perm) => perm.toString());
    const newPermissions = permissions.filter(
      (perm) => !existingPermissions.includes(perm)
    );

    if (newPermissions.length === 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Tất cả quyền này đã được gán cho role" });
    }

    role.permissions = [...new Set([...role.permissions, ...permissions])];
    await role.save();

    res.status(StatusCodes.OK).json({
      message: "Quyền hạn của vài trò đã được cập nhật thành công",
      roleId: id,
      addedPermissions: newPermissions,
      updatedPermissions: role.permissions,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server.", error: error.message });
  }
};

exports.revokePermissionsFromRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { permissions } = req.body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Danh sách quyền không hợp lệ" });
    }

    const role = await Role.findById(id);
    if (!role) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Vai trò không tồn tại" });
    }

    if (role.permissions.length === 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Vai trò này không có quyền nào để thu hồi" });
    }

    const existingPermissions = role.permissions.map((perm) => perm.toString());
    const notFoundPermissions = permissions.filter(
      (perm) => !existingPermissions.includes(perm)
    );

    if (notFoundPermissions.length === permissions.length) {
      return res.status(StatusCodes.CONFLICT).json({
        message:
          "Không có quyền nào trong danh sách cần thu hồi thuộc vai trò này",
        notFoundPermissions,
      });
    }

    role.permissions = role.permissions.filter(
      (perm) => !permissions.includes(perm.toString())
    );

    await role.save();

    res.status(StatusCodes.OK).json({
      message: "Thu hồi quyền thành công",
      roleId: id,
      revokedPermissions: permissions.filter((perm) =>
        existingPermissions.includes(perm)
      ),
      notFoundPermissions,
      updatedPermissions: role.permissions,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server.", error: error.message });
  }
};
