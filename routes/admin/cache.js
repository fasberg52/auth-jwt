const express = require("express");
const router = express.Router();

const cacheService = require("../../services/cacheService");

router.delete("/:cacheKey", async (req, res) => {
  const cacheKey = req.params.cacheKey;
  try {
    await cacheService.delete(cacheKey);
    res.json({ message: `Cache cleared for key: ${cacheKey}` });
  } catch (error) {
    console.error(`Error clearing cache for key ${cacheKey}`, error);
    res
      .status(500)
      .json({ error: "An error occurred while clearing the cache." });
  }
});

module.exports = router;
