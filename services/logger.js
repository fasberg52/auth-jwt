//services//logger.js
const winston = require("winston");

// Define the Winston logger configuration
const logger = winston.createLogger({
  level: "info", // Set the default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: "logfile.log" }), // Log to a file
  ],
});

logger.success = function (message, meta) {
  this.log({
    level: "success",
    message,
    meta,
  });
};

module.exports = logger;
