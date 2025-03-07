const express = require("express");
const sendMail = require("../config/mailer");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const { sendEmailToCandidates } = require("../controller/emailController");
const router = express.Router();

router.post("/send_email", sendEmailToCandidates);




module.exports = router;
