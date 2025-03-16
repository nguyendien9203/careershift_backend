const express = require("express");
const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const roleRoutes = require("./role.route");
const jobRoutes = require("./job.route");
const s3Routes = require("./s3.route");
const recruitmentRoutes = require("./recruitment.route");
const interviewRoutes = require('./interview.route');
const candidateComparisonRoutes = require('./candidateComparison.route');


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/jobs", jobRoutes);
router.use("/s3", s3Routes);
router.use("/recruitments", recruitmentRoutes);
router.use("/interviews", interviewRoutes);
router.use("/candidateComparisons", candidateComparisonRoutes);


module.exports = router;
