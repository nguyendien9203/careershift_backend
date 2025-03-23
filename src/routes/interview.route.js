const express = require("express");

const {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterviewStage,
  updateInterview,
  updateFinalStatus,
  getRecruitmentOptions,getUsers
} = require("../controllers/interview.controllers");

const router = express.Router();

const {
  sendInterviewInvitation,
  cancelInterview,
  createInterviewStage,
} = require("../controllers/interview-email.controllers");
const {
  getInterviewsByRecruitment,
  getUpcomingInterviews,
  getInterviewerWorkload,
  getInterviewStages,
  updateInterviewMode,
  updateInterviewDateTime,
} = require("../controllers/interview-management.controllers");
const {
  assignInterviewers,
  removeInterviewer,
} = require("../controllers/interview-assignment.controllers");

const {
  viewEvaluations,
  getEvaluationSummary,
  updatePassFail,
} = require("../controllers/interview-evaluation.controllers");

// Route lấy danh sách lịch phỏng vấn
router.get("/interviews", getInterviews);
// Route lấy một lịch phỏng vấn theo ID
router.get("/interviews/:id", getInterviewById);

// Route tạo lịch phỏng vấn
router.post("/createInterviews", createInterview);

// Route cập nhật kết quả từng vòng phỏng vấn
router.put("/interviews/update-stage", updateInterviewStage);

// Cập nhật lịch phỏng vấn
router.put("/UpdateInterviews/:id", updateInterview);
//Send email cho ứng viên
router.post("/send-interview-invitation", sendInterviewInvitation);

// xem lịch phỏng vấn theo recruiment
router.get("/recruitment/:recruitmentId", getInterviewsByRecruitment);

//Xem những lịch phỏng vấn ở những ngày tiếp theo
router.get("/upcoming", getUpcomingInterviews);
//Xem công việc của người phỏng vấn
router.get("/interviewer-workload/:interviewerId", getInterviewerWorkload);
// Thêm người phỏng vấn vào 1 vòng phỏng vấn
router.put("/assign-interviewers", assignInterviewers);
//Loại bỏ người phỏng vấn ra ngoài cuộc phỏng vấn
router.put("/remove-interviewer", removeInterviewer);
//Xem chi tiết các vòng phỏng vấn
router.get("/stages/:interviewId", getInterviewStages);

// Xem đánh giá của một người phỏng vấn trong một phỏng vấn
router.get("/view-evaluations/:interviewId/:interviewerId", viewEvaluations);

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

router.post("/updateFinalStatus", updateFinalStatus);
router.get("/recruitment-options", getRecruitmentOptions);
router.get("/userss", getUsers); 
module.exports = router;
