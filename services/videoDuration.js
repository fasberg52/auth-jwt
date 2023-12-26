const { getVideoDurationInSeconds } = require("get-video-duration");

async function getDuration(videoPath) {
  return getVideoDurationInSeconds(videoPath).then((duration) => {
    return duration;
  });
}
module.exports = { getDuration };
