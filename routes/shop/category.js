const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();


router.get("/category", categoryController.getAllCategories);

module.exports=router