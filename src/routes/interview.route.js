const express = require("express");
const interviewRouter = express.Router();

const {
    createInterview,
    getInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview,
    evaluationSummary,
} = require("../controllers/interview.controllers");
// const { authenticateToken } = require("../middlewares/auth");

interviewRouter.post("/", createInterview);
interviewRouter.get("/", getInterviews);
interviewRouter.get("/:id", getInterviewById);
interviewRouter.put("/:id/update-interview", updateInterview);
interviewRouter.delete("/:id", deleteInterview);
interviewRouter.get("/:id/evaluation-summary", evaluationSummary);

module.exports = interviewRouter;
