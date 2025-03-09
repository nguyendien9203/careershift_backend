const express = require("express");
const interviewRouter = express.Router();

const {
    createInterview,
    getInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview,
    getEvaluationSummary,
} = require("../controllers/interview.controllers");
// Need a middleware to decode token, will do it later and add to routes
const { authenticateToken } = require("../middlewares/auth");

interviewRouter.post("/", createInterview);
interviewRouter.get("/", getInterviews);
interviewRouter.get("/:id", getInterviewById);
interviewRouter.put("/:id/update-interview", updateInterview);
interviewRouter.delete("/:id", deleteInterview);
interviewRouter.get("/:id/evaluation-summary", getEvaluationSummary);