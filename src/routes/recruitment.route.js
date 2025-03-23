const express = require("express");
const router = express.Router();

const { recruitmentController } = require("../controllers/index");

const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");

router.get(
    "/stages/:jobId",
    authenticateToken,
    authorizeRole(["HR", "Manager"]),
    hasPermission(["VIEW_RECRUITMENT_PROGRESS"]),
    recruitmentController.getCandidatesByStage
  );
  router.post(
    "/:jobId",
    authenticateToken,
    authorizeRole(["HR"]),
    hasPermission(["ADD_CANDIDATE_RECRUITING", "ADD_RECRUITMENT_NOTES", "UPLOAD_CANDIDATE_CV"]),
    recruitmentController.applyForJob
  );

  router.delete(
    "/:recruitmentId",
    authenticateToken,
    authorizeRole(["HR", "Manager"]),
    hasPermission(["DELETE_CANDIDATE_RECRUITING"]),
    recruitmentController.deleteRecruitment
  );

router.put("/:recruitmentId", 
    authenticateToken,authorizeRole(["HR", "Manager"]),
    hasPermission(["UPDATE_CANDIDATE_RECRUITING", "UPDATE_RECRUITMENT_STATUS", "MARK_POTENTIAL_CANDIDATE"]), 
    recruitmentController.updateRecruitment
  );

router.get(
  "/:recruitmentId",
  // authenticateToken,
  // authorizeRole(["HR", "Admin"]),
  // hasPermission(["VIEW_RECRUITMENT_DETAILS"]),
  recruitmentController.getRecruitmentById
);

router.get(
  "/:jobId",
  authenticateToken,
  authorizeRole(["HR", "Manager"]),
  hasPermission(["VIEW_RECRUITMENT_PROGRESS"]),
  recruitmentController.getRecruitmentByJobId
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
