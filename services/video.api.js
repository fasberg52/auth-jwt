const ApiVideoClient = require("@api.video/nodejs-client");

async function getVideoDurationFromApi(videoPath) {
  try {
    const client = new ApiVideoClient({
      apiKey: process.env.API_VIDEO_KEY,
    });
    const videoId = videoPath;
    const result = await client.videos.getStatus(videoId);
    const response = result.encoding.metadata.duration;
    console.log(response);
    //console.log(Object.keys(response));
    return response;
  } catch (error) {
    console.error(`Error getting video duration from API: ${error.message}`);
    console.error("Full error response:", error.response.data);
    throw error;
  }
}
module.exports = { getVideoDurationFromApi };
