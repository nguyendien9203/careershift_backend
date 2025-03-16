const express = require("express");

const { sendEmailToCandidates } = require("../controller/emailController");
const router = express.Router();

router.post("/send_email", sendEmailToCandidates);




module.exports = router;
