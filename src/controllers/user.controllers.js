const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Permission = require("../models/permission.model");
const { UserStatus } = require("../constants");
const { sendTempPasswordToUser } = require("../config/email");
const { invalidateUserTokens, blacklistAccessToken } = require("../config/jwt");

// Role: Admin -> See the user list is not admin
exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("roles");

    if (!user || !user.roles) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Bạn chưa có quyền hạn nào" });
    }

    const users = await User.find({ roles: { $nin: [user.roles] } })
      .populate("roles", "name")
      .select("-password -failedLoginAttempts -lockedUntil -__v");

    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: all -> View self profile
exports.getSelfProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -failedLoginAttempts -lockedUntil -__v")
      .populate("roles", "-permissions -updatedAt");

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy người dùng" });
    }

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: all -> View personal information after successful authentication
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "roles",
      select: "_id name permissions",
    });

    if (!user)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Người dùng không tồn tại" });

    const permissions = await Permission.find({
      _id: { $in: user.roles.permissions },
    }).select("_id name");

    res.status(StatusCodes.OK).json({
      id: user._id,
      email: user.email,
      role: {
        id: user.roles._id,
        name: user.roles.name,
      },
      permissions: permissions,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: Admin -> Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, roles } = req.body;

    if (!name || !email || !roles) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu thông tin hoặc dữ liệu không hợp lệ",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email đã tồn tại" });
    }

    const validRoles = await Role.find({ _id: { $in: roles } });
    if (!validRoles) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Có role không hợp lệ" });
    }

    const { success, message, tempPassword } = await sendTempPasswordToUser(
      name,
      email
    );

    if (!success) return res.status(500).json({ message });

    const newUser = new User({
      name,
      email,
      password: tempPassword,
      status: UserStatus.ACTIVE,
      verified: false,
      roles,
    });

    await newUser.save();

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Người dùng đã được tạo thành công" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: Admin -> Update information of every user
exports.updateAllUsers = async (req, res) => {
  try {
    const { name, email, phone, status, roles, verified } = req.body;

    if (!name || !email || !roles) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu thông tin hoặc dữ liệu không hợp lệ",
      });
    }

    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Người dùng không tồn tại" });
    }

    if (email && email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Email đã tồn tại" });
      }
    }

    const validRoles = await Role.find({ _id: { $in: roles } });
    if (!validRoles) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Có role không hợp lệ" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, status, verified, roles },
      {
        new: true,
        select: "-password -failedLoginAttempts -lockedUntil -__v",
      }
    );

    res
      .status(StatusCodes.OK)
      .json({ message: "Cập nhật thành công", updatedUser });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// Role: all -> Update personal information (Self-update)
exports.updateSelfProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu thông tin hoặc dữ liệu không hợp lệ",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Người dùng không tồn tại",
      });
    }

    user.name = name;
    user.phone = phone;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: "Cập nhật thành công",
      user: {
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: Admin -> Activate / disable account
exports.activateDeactivateUser = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Người dùng không tồn tại" });
    }

    user.status = status;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: `Tài khoản ${user.name} - ${user.email} đã được ${
        user.status === UserStatus.ACTIVE ? "kích hoạt" : "vô hiệu hóa"
      } thành công`,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: Admin -> Assign Role to users
exports.assignRoles = async (req, res) => {
  try {
    const { roles } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Người dùng không tồn tại" });
    }

    user.roles = roles;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: `Gán vai trò mới thành công cho người dùng ${user.name} - ${user.email}`,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Role: Admin -> Reset password for users
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const token = req.headers.authorization?.split(" ")[1];

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const { success, message, tempPassword } = await sendTempPasswordToUser(
      user.name,
      user.email
    );

    if (!success) return res.status(500).json({ message });

    user.password = tempPassword;
    await user.save();
    await invalidateUserTokens(user._id);

    if (token) {
      await blacklistAccessToken(token);
    }

    res.status(200).json({
      message:
        "Mật khẩu đã được đặt lại, người dùng sẽ bị đăng xuất và phải đổi mật khẩu mới",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Role: all -> Change password
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }
    if (newPassword.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Email không tồn tại" });
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Mật khẩu hiện tại không chính xác" });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Mật khẩu mới không được trùng với mật khẩu cũ" });
    }

    user.password = newPassword;
    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ message: "Thay đổi mật khẩu thành công" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Role: Admin -> Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
