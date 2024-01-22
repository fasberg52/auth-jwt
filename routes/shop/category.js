const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const express = require("express");
const categoryController = require("../../.github/category");
const router = express.Router();

router.get("/", jwtAuthMiddleware, categoryController.getAllCategories);

module.exports = router;
