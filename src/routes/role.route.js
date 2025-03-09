const express = require("express");
const { roleController } = require("../controllers/index");

const router = express.Router();

router.get("/", roleController.getAllRoles);
router.get("/:id/permissions", roleController.getPermissionByRole);
router.put("/:id/permissions", roleController.updateRolePermissions);

module.exports = router;
