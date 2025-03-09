const express = require("express");
const authRoutes = require("./auth.route");
const jobRoutes = require("./job.route");
const s3Routes = require("./s3.route");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/job", jobRoutes);
router.use("/s3", s3Routes);

module.exports = router;
