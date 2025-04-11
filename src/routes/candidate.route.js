const express = require("express");
const {
  getCompletedCandidateComparisons,
  sendEmailToCandidates,
} = require("../controllers/candidate.controllers");

const router = express.Router();

router.get("/", getCompletedCandidateComparisons);
router.post("/send_email", sendEmailToCandidates);

module.exports = router;
