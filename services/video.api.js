const ApiVideoClient = require("@api.video/nodejs-client");
const logger = require("../services/logger")
async function getVideoDurationFromApi(videoPath) {
  try {
    const client = new ApiVideoClient({
      apiKey: process.env.API_VIDEO_KEY,
    });
    const videoId = videoPath;
    const result = await client.videos.getStatus(videoId);
    const response = result.encoding.metadata.duration;
    return response;
  } catch (error) {
    logger.error("Error getting video duration from API", error);
    console.error(`>>>> Error getting video duration from API: ${error.message}`);
    console.error("Full error response:", error.response.data);
    throw error;
  }
}
module.exports = { getVideoDurationFromApi };
