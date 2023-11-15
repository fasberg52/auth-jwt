const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware = require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const upload = require("../../utils/multerUtils");
const {createUpload} = require("../../controllers/upload");
const router = express.Router();

router.post("/upload",);

router.get("/upload");

router.put("upload");

router.delete("upload");

module.exports = router;
