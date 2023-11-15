const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware = require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const upload = require("../../utils/multerUtils");

const router = express.Router();

router.post("/upload");

module.exports = router;
