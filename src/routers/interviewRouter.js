const express = require("express");
const { getCandidatepassedinterview } = require("../controller/interviewController");
const router = express.Router();

router.get("/", getCandidatepassedinterview);

module.exports = router;