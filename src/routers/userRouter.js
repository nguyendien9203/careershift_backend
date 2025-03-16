const express = require("express");
const { createUser, getManagers } = require("../controller/userController");
const router = express.Router();

router.post("/create",createUser );
router.get("/manager",getManagers );
module.exports = router;