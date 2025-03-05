const express = require("express");
const authRoutes = require("./auth.route");
const jobRoutes = require("./job.route");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/job", jobRoutes);

module.exports = router;
