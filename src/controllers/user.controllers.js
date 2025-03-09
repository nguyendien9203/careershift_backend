const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const Permission = require("../models/permission.model");

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
