const express = require("express");
const jobRouter = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByUserId,
} = require("../controllers/job.controllers");
// Need a middleware to decode token, will do it later and add to routes
const { authenticateToken } = require("../middlewares/auth.middleware");

jobRouter.post("/", createJob);
jobRouter.get("/", getJobs);
jobRouter.get("/:id", getJobById);
jobRouter.put("/:id/update-job", updateJob);
jobRouter.delete("/:id", deleteJob);
jobRouter.get("/user/:id", getJobsByUserId);

module.exports = jobRouter;
