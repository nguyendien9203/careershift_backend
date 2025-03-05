const express = require("express");
const {
  sendInterviewEmail,
  updateCandidateStatus,
} = require("../controllers/candidateController");

const router = express.Router();

router.post("/candidates/send-email", sendInterviewEmail);
router.get("/candidates/update-status", updateCandidateStatus);
router.post("/candidates/update-status", updateCandidateStatus);
module.exports = router;
