const express = require("express");
const { getInterviews,
    getInterviewById,
    createInterview,
    updateInterviewStage, 
    deleteInterview,
    updateInterview, } = require("../controllers/interviewController");

const {sendInterviewInvitation} = require("../controllers/sendEmailController")

const router = express.Router();

// Route lấy danh sách lịch phỏng vấn
router.get("/interviews", getInterviews);
// Route lấy một lịch phỏng vấn theo ID
router.get("/interviews/:id", getInterviewById);

// Route tạo lịch phỏng vấn
router.post("/createInterviews", createInterview);

// Route cập nhật kết quả từng vòng phỏng vấn
router.put("/interviews/update-stage", updateInterviewStage);

// Xóa lịch phỏng vấn
router.delete("/interviews/:id", deleteInterview);

// Cập nhật lịch phỏng vấn
router.put("/UpdateInterviews/:id", updateInterview);

router.post('/send-interview-invitation', sendInterviewInvitation);

module.exports = router;
