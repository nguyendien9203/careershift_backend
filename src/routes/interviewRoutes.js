const express = require("express");
const { getInterviews,getInterviewById,createInterview } = require("../controllers/interviewController");

const router = express.Router();

// Route lấy danh sách lịch phỏng vấn
router.get("/interviews", getInterviews);
// Route lấy một lịch phỏng vấn theo ID
router.get("/interviews/:id", getInterviewById);

// Route tạo lịch phỏng vấn
router.post("/createInterviews", createInterview);
module.exports = router;
