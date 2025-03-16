const express = require("express");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

const router = express.Router();

// API: Tạo Role mới
exports.createRole = async (req, res) => {
    try {
        const { name, description, permissionIds, createdBy } = req.body;

        // Kiểm tra xem tất cả permissionIds có tồn tại trong database không
        const permission = await Permission.findById(permissionIds);
        if (!permission) {
          return res.status(400).json({ message: "Một hoặc nhiều quyền không tồn tại!" });
        }

        // Tạo Role mới
        const newRole = new Role({
            name,
            description,
            permissions: permissionIds,
            createdBy,
        });

        await newRole.save();
        res.status(201).json({ message: "Tạo role thành công!", role: newRole });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};
