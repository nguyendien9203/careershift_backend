const express = require("express");
const { createPermission } = require("../controller/permissionController");
const router = express.Router();

router.post("/create",createPermission );
module.exports = router;