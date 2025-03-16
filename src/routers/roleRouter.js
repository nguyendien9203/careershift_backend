const express = require("express");
const { createRole } = require("../controller/roleController");
const router = express.Router();

router.post("/create",createRole );
module.exports = router;