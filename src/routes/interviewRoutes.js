const express = require("express");
const { getInterviews,
    getInterviewById,
    createInterview,
    updateInterviewStage, 
    deleteInterview,
    updateInterview, } = require("../controllers/interviewController");

const {sendInterviewInvitation} = require("../controllers/sendEmailController")
const {getInterviewsByRecruitment,getUpcomingInterviews} = require("../controllers/interviewManagementController")
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
//Send email cho ứng viên 
router.post('/send-interview-invitation', sendInterviewInvitation);

// xem lịch phỏng vấn theo recruiment
router.get('/recruitment/:recruitmentId', getInterviewsByRecruitment);

//Xem những lịch phỏng vấn ở những ngày tiếp theo 
router.get('/upcoming', getUpcomingInterviews);
module.exports = router;
