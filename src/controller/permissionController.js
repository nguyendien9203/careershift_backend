const express = require("express");
const Permission = require("../models/Permission");

const router = express.Router();

// API: Tạo Role mới
exports.createPermission = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Kiểm tra xem Permission đã tồn tại chưa
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            return res.status(400).json({ message: "Permission đã tồn tại!" });
        }

        const newRole = new Permission({ name, description });
        await newRole.save();

        res.status(201).json({ message: "Tạo permission thành công!", role: newRole });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};

