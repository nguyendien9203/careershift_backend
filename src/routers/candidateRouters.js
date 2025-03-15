const express = require("express");
const {
  sendInterviewEmail,
  updateCandidateStatus,
  getCandidatesByStatus, 
  searchCandidates, 
  getPotentialCandidates
} = require("../controllers/candidateController");

const router = express.Router();

router.post("/candidates/send-email", sendInterviewEmail);
router.post("/candidates/update-status", updateCandidateStatus);
router.get("/candidates/status/:status", getCandidatesByStatus);
router.get("/candidates/search/:keyword", searchCandidates);
router.get("/candidates/potential", getPotentialCandidates);
module.exports = router;
