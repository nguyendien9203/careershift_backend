const express = require("express");
const {
  sendInterviewEmail,
  updateCandidateStatus,
} = require("../controllers/candidateController");

const router = express.Router();

router.post("/candidates/send-email", sendInterviewEmail);
router.post("/candidates/update-status", updateCandidateStatus);

module.exports = router;
