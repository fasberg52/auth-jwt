const express = require("express");
const router = express.Router();
const { checkRole } = require("../../middleware/checkAccess");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { exportUsersToExcel } = require("../../services/excel");
router.get(
  "/export-users",
//   jwtAuthMiddleware,
//   checkRole("admin"),
  exportUsersToExcel
);

module.exports = router;
