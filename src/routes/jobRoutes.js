const express = require("express");
const jobRouter = express.Router();
const { createJob, getJobs, getJob, updateJob, deleteJob } = require("../controllers/jobController");
// Need a middleware to decode token, will do it later and add to routes
// const { authenticate } = require("../middleware/authMiddleware");

jobRouter.post("/", createJob);
jobRouter.get("/", getJobs);
jobRouter.get("/:id", getJob);
jobRouter.put("/:id", updateJob);
jobRouter.delete("/:id", deleteJob);