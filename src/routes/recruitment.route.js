const express = require("express");
const router = express.Router();
const { recruitmentController } = require("../controllers");
// const { authenticateToken } = require("../middlewares/auth");

router.get("/stages/:jobId", recruitmentController.getCandidatesByStage);
router.post("/:jobId", recruitmentController.applyForJob);
router.delete("/:recruitmentId", recruitmentController.deleteRecruitment);
// candidateRouter.post("/", createCandidate);
// candidateRouter.get("/", getAllCandidates);
// candidateRouter.get("/:id", getCandidateById);
// candidateRouter.put("/:id", updateCandidate);
// candidateRouter.delete("/:id", deleteCandidate);
// candidateRouter.get("/user/:id", getCandidateByUserCreatedId);

module.exports = router;
