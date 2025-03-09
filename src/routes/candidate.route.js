const express = require("express");
const candidateRouter = express.Router();
const {createCandidate, getAllCandidates, getCandidateById, updateCandidate, deleteCandidate, getCandidatesByUserCreatedId } = require("../controllers/candidate.controller");
const { authenticateToken } = require("../middlewares/auth");


candidateRouter.post("/", createCandidate);
candidateRouter.get("/", getAllCandidates);
candidateRouter.get("/:id", getCandidateById);
candidateRouter.put("/:id/update-candidate", updateCandidate);
candidateRouter.delete("/:id", deleteCandidate);
candidateRouter.get("/user/:id", getCandidatesByUserCreatedId);

module.exports = candidateRouter;