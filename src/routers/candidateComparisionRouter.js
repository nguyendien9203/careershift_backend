const express = require("express");
const { getCompletedCandidateComparisons } = require("../controller/candidateComparisonController");
const router = express.Router();

router.get("/", getCompletedCandidateComparisons);

module.exports = router;