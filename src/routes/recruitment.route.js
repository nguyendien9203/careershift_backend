const express = require("express");
const router = express.Router();
const { recruitmentController } = require("../controllers");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");

router.get(
  "/stages/:jobId",
  authenticateToken,
  recruitmentController.getCandidatesByStage
);
router.post(
  "/:jobId",
  authenticateToken,
  authorizeRole(["HR"]),
  hasPermission(["ADD_CANDIDATE_RECRUITING"]),
  recruitmentController.applyForJob
);
router.delete(
  "/:recruitmentId",
  authenticateToken,
  authorizeRole(["HR", "Admin"]),
  hasPermission(["DELETE_CANDIDATE_RECRUITING"]),
  recruitmentController.deleteRecruitment
);
router.post(
  "/:recruitmentId/send-interview",
  authenticateToken,
  authorizeRole(["HR"]),
  hasPermission(["SEND_CANDIDATE_EMAIL"]),
  recruitmentController.sendInterviewInvitation
);
router.post(
  "/:recruitmentId/update-interview-response",
  authenticateToken,
  authorizeRole(["HR", "Manager"]),
  hasPermission(["UPDATE_RECRUITMENT_STATUS"]),
  recruitmentController.updateRecruitmentStatus
);

module.exports = router;
