const express = require("express");
const { getAllCandidates } = require("../controller/candidateController");
const router = express.Router();

router.get("/", getAllCandidates);

module.exports = router;