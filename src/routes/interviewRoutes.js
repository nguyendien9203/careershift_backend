const express = require("express");
const { getInterviews } = require("../controllers/interviewController");

const router = express.Router();

// Route lấy danh sách lịch phỏng vấn
router.get("/interviews", getInterviews);

module.exports = router;
