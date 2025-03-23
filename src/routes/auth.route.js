const express = require("express");
const { authController } = require("../controllers/index");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authenticateToken, authController.logout);
router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);

module.exports = router;
