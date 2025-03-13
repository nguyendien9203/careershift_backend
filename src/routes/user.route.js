const express = require("express");
const { userController } = require("../controllers/index");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRole(["Admin"]),
  hasPermission(["VIEW_ALL_USERS"]),
  userController.getAllUsers
);
router.get(
  "/profile/me",
  authenticateToken,
  hasPermission(["VIEW_SELF_PROFILE"]),
  userController.getSelfProfile
);
router.get("/:id/whoami", authenticateToken, userController.getUserInfo);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Admin"]),
  hasPermission(["CREATE_USERS"]),
  userController.createUser
);
router.post(
  "/:id/reset-password",
  authenticateToken,
  authorizeRole(["Admin"]),
  hasPermission(["RESET_PASSWORD"]),
  userController.resetPassword
);
router.post("/reset-password", userController.resetPassword);
router.post(
  "/change-password",
  authenticateToken,
  userController.changePassword
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  hasPermission(["UPDATE_ALL_USERS"]),
  userController.updateAllUsers
);
router.put(
  "/profile/me",
  authenticateToken,
  hasPermission(["UPDATE_SELF_PROFILE"]),
  userController.updateSelfProfile
);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole(["Admin"]),
  hasPermission(["ACTIVATE_DEACTIVATE_USER"]),
  userController.activateDeactivateUser
);
router.patch(
  "/:id/roles",
  authenticateToken,
  authorizeRole(["Admin"]),
  hasPermission(["ASSIGN_ROLES"]),
  userController.assignRoles
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("Admin"),
  hasPermission(["DELETE_USERS"]),
  userController.deleteUser
);

module.exports = router;
