const express = require("express");
const candidateRouter = express.Router();
const {createCandidate, getAllCandidates, getCandidateById, updateCandidate, deleteCandidate, getCandidateByUserCreatedId } = require("../controllers/candidate.controllers");
// const { authenticateToken } = require("../middlewares/auth");


candidateRouter.post("/", createCandidate);
candidateRouter.get("/", getAllCandidates);
candidateRouter.get("/:id", getCandidateById);
candidateRouter.put("/:id", updateCandidate);
candidateRouter.delete("/:id", deleteCandidate);
candidateRouter.get("/user/:id", getCandidateByUserCreatedId);

module.exports = candidateRouter;