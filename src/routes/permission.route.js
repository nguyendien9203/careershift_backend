const express = require("express");
const { permissionController } = require("../controllers/index");

const router = express.Router();

router.get("/", permissionController.getPermissionsByCategory);

module.exports = router;
