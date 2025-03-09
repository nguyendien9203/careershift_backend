const express = require("express");
const { userController } = require("../controllers/index");

const router = express.Router();

router.get("/:id/whoami", userController.getUserInfo);

module.exports = router;
