const express = require("express");
const { roleController } = require("../controllers/index");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");

const router = express.Router();

router.get(
  "/roles-for-user-assignment",
  authenticateToken,
  authorizeRole(["Admin"]),
  roleController.getAllRolesForUserAssignment
);
router.post(
  "/",
  authenticateToken,
  authorizeRole("Admin"),
  hasPermission(["CREATE_ROLE"]),
  roleController.createRole
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("Admin"),
  hasPermission(["EDIT_ROLE"]),
  roleController.updateRole
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("Admin"),
  hasPermission(["DELETE_ROLE"]),
  roleController.deleteRole
);
router.get(
  "/role-with-permissions",
  authenticateToken,
  hasPermission(["VIEW_ROLES_PERMISSIONS"]),
  roleController.getRolesWithPermissions
);
router.put(
  "/:id/assign-permissions",
  authenticateToken,
  authorizeRole("Admin"),
  hasPermission(["ASSIGN_PERMISSIONS_TO_ROLE"]),
  roleController.assignPermissionsToRole
);
router.put(
  "/:id/revoke-permissions",
  authenticateToken,
  hasPermission(["REVOKE_PERMISSIONS_FROM_ROLE"]),
  authorizeRole("Admin"),
  roleController.revokePermissionsFromRole
);

module.exports = router;
