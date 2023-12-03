const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
const { getManager } = require("typeorm");
const SecureLink = require("../model/secureLink");
async function createSecureLink(req, res) {
  try {
    const { secureLink } = req.params;

    // Check if the secure link is valid
    const secureLinkRepository = getManager().getRepository(SecureLink);
    const isValid = await secureLinkRepository.findOne({
      where: { token: secureLink },
    });

    if (isValid) {
      // Secure link is valid, serve the video
      const videoPath =
        "https://dl3.baclass.online/sarsalari/01-Sarsalari-1402-07-12-1.m4v";
      const stat = fs.statSync(videoPath);

      // Set the response headers
      res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Length": stat.size,
      });

      // Create a readable stream from the video file and pipe it to the response
      const stream = fs.createReadStream(videoPath);
      stream.pipe(res);
    } else {
      // Secure link is not valid, respond with an error
      res.status(403).send("Invalid secure link");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createSecureLink,
};
