const express = require("express");

const { jobController } = require("../controllers/index");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");
// Need a middleware to decode token, will do it later and add to routes

const jobRouter = express.Router();

jobRouter.post(
  "/",
  authenticateToken,
  authorizeRole(["HR"], hasPermission(["CREATE_JOB_LISTING"])),
  jobController.createJob
);

jobRouter.get(
  "/",
  authenticateToken,
  authorizeRole(["HR", "Manager"]),
  hasPermission(["VIEW_JOB_LISTINGS"]),
  jobController.getJobs
);

jobRouter.get(
  "/:id",
  authenticateToken,
  authorizeRole(["HR", "Manager"]),
  hasPermission(["VIEW_JOB_DETAILS"]),
  jobController.getJobById
);

jobRouter.put(
  "/:id",
  authenticateToken,
  authorizeRole(["HR"]),
  hasPermission(["EDIT_JOB_LISTING"]),
  jobController.updateJob
);

jobRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["HR"]),
  hasPermission(["DELETE_JOB_LISTING"]),
  jobController.deleteJob
);

jobRouter.get(
  "/user/:id",
  authenticateToken,
  authorizeRole(["HR"]),
  jobController.getJobsByUserId
);

module.exports = jobRouter;
