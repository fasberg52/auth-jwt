const { hrtime } = require("process");
const os = require("os");
const logger = require("../services/logger");
function loggerMiddleware(req, res, next) {
  const { ip, method, baseUrl } = req;
  const userAgent = req.get("user-agent") || "";
  const location = req.get("location") || ""; // Assuming you have a custom header for the location
  const startAt = hrtime();

  // Extract device information from the operating system
  const deviceInfo = `${os.type()} - ${os.platform()} ${os.arch()}`;

  res.on("finish", () => {
    const { statusCode } = res;
    const contentLength = res.get("content-length");
    const dif = hrtime(startAt);
    const responseTime = dif[0] * 1e3 + dif[1] * 1e-6;
    logger.info(
      `${method} ${baseUrl} ${statusCode} ${contentLength} - ${responseTime.toFixed(
        2
      )}ms ${userAgent} ${deviceInfo} ${location} ${ip}`
    );
    console.log(
      `${method} ${baseUrl} ${statusCode} ${contentLength} - ${responseTime.toFixed(
        2
      )}ms ${userAgent} ${deviceInfo} ${location} ${ip}`
    );
  });

  next();
}

module.exports = { loggerMiddleware };
