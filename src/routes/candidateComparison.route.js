const express = require("express");
const candidateComparisonRouter = express.Router();

const {
    saveCandidateComparison,
    updateCandidateComparison,
    getAllCandidateComparisons,
} = require("../controllers/candidateComparison.controllers");

candidateComparisonRouter.post("/:jobId/add-candidate-comparison", saveCandidateComparison);
candidateComparisonRouter.put("/update-candidate-comparison/:candidateComparisonId", updateCandidateComparison);
candidateComparisonRouter.get("/getAll-canidateComparison", getAllCandidateComparisons);

module.exports = candidateComparisonRouter;

