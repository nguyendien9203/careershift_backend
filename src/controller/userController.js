const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Role = require("../models/Role");

const router = express.Router();

// API: Tạo User mới
const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex kiểm tra password hợp lệ (ít nhất 8 ký tự, có chữ và số)
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

exports.createUser = async (req, res) => {
    try {
        const { email, password, name, roleId } = req.body;
    
        if (!email || !password || !name || !roleId) {
          return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }
    
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email đã tồn tại!" });
        }
    
        // Kiểm tra Role có tồn tại không
        const role = await Role.findById(roleId);
        if (!role) {
          return res.status(400).json({ message: "Role không tồn tại!" });
        }
    
        // Tạo user mới (Schema sẽ tự động hash password)
        const newUser = new User({
          email,
          password, // Truyền password thô, schema sẽ tự động hash
          name,
          roles: role._id,
        });
    
        await newUser.save();
        res.status(201).json({ message: "Tạo user thành công!", user: newUser });
      } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
      }
    };

    exports.getManagers = async (req, res) => {
        try {
            // Tìm role có tên "manager"
            const managerRole = await Role.findOne({ name: "Manager" });
            if (!managerRole) {
                return res.status(404).json({ message: "Không tìm thấy role manager!" });
            }
    
            // Tìm tất cả user có role là "manager"
            const managers = await User.find({ roles: managerRole._id });
    
            res.status(200).json({ managers });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server!", error });
        }
    };