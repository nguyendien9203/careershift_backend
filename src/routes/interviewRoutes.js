const express = require("express");
const router = express.Router();
const { getInterviews,
    getInterviewById,
    createInterview,
    updateInterviewStage, 
    deleteInterview,
    updateInterview, createInterviewStage} = require("../controllers/interviewController");

const {sendInterviewInvitation,cancelInterview} = require("../controllers/sendEmailController")
const {getInterviewsByRecruitment,
    getUpcomingInterviews,
    getInterviewerWorkload,
    getInterviewStages,updateInterviewMode,updateInterviewDateTime} = require("../controllers/interviewManagementController")
const {assignInterviewers,removeInterviewer} = require("../controllers/interviewAssignmentController")

const {viewEvaluations,getEvaluationSummary ,updatePassFail} = require("../controllers/interviewEvaluationController");



// Route lấy danh sách lịch phỏng vấn
router.get("/interviews", getInterviews);
// Route lấy một lịch phỏng vấn theo ID
router.get("/interviews/:id", getInterviewById);

// Route tạo lịch phỏng vấn
router.post("/createInterviews", createInterview);

// Route cập nhật kết quả từng vòng phỏng vấn
router.put("/interviews/update-stage", updateInterviewStage);

// Xóa lịch phỏng vấn
router.delete("/interviews/deleteInterview/:id", deleteInterview);

// Cập nhật lịch phỏng vấn
router.put("/UpdateInterviews/:id", updateInterview);
//Send email cho ứng viên 
router.post('/send-interview-invitation', sendInterviewInvitation);

// xem lịch phỏng vấn theo recruiment
router.get('/recruitment/:recruitmentId', getInterviewsByRecruitment);

//Xem những lịch phỏng vấn ở những ngày tiếp theo 
router.get('/upcoming', getUpcomingInterviews);
//Xem công việc của người phỏng vấn
router.get('/interviewer-workload/:interviewerId', getInterviewerWorkload);
// Thêm người phỏng vấn vào 1 vòng phỏng vấn
router.put('/assign-interviewers', assignInterviewers); 
//Loại bỏ người phỏng vấn ra ngoài cuộc phỏng vấn
router.put('/remove-interviewer', removeInterviewer);
//Xem chi tiết các vòng phỏng vấn
router.get('/stages/:interviewId', getInterviewStages);

// Xem đánh giá của một người phỏng vấn trong một phỏng vấn 
router.get('/view-evaluations/:interviewId/:interviewerId', viewEvaluations); 

// Tổng hợp kết quả phỏng vấn tất cả ứng viên, người phỏng vấn, score, và comment
router.get("/evaluation-summary/all", getEvaluationSummary);

//Update pass/fail từng vòng phỏng vấn
router.put("/update-pass-fail", updatePassFail);

//Update mode Online/Offline
router.put("/update-mode/:interviewId", updateInterviewMode);

//Hủy lịch phỏng vấn finalStatus: CANCELED và send email
router.put("/cancel/:interviewId", cancelInterview);
//Tạo vòng phỏng vấn cho lịch phỏng vấn
router.post("/createInterviewStage", createInterviewStage);
//Update thời gian phỏng vấn và check trùng của
router.post("/updateInterviewDateTime", updateInterviewDateTime);


module.exports = router;
