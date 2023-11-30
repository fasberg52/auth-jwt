const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
const { getManager } = require("typeorm");
const SecureLink = require("../model/secureLink");
async function createSecureLink(originalLink) {
  try {
    // Download the video from the original link
    const response = await axios.get(originalLink, {
      responseType: "arraybuffer",
    });

    // Generate a random token for the secure link
    const token = crypto.randomBytes(16).toString("hex");

    // Save the downloaded video to a temporary file
    const tempFilePath = `./temp/${token}.m4v`; // Adjust the path as needed
    await fs.writeFile(tempFilePath, Buffer.from(response.data));

    // Save the secure link to the database
    const secureLinkRepository = getManager().getRepository(SecureLink);
    const secureLink = secureLinkRepository.create({
      originalLink,
      token,
      filePath: tempFilePath, // Store the path to the temporary file
    });

    await secureLinkRepository.save(secureLink);
    console.log("response>>>>>>>" + response);
    return token;
  } catch (error) {
    console.error(`Error creating secure link: ${error.message}`);
    throw error;
  }
  
}

module.exports = {
  createSecureLink,
};
