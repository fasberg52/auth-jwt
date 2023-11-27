//services//logger.js
const winston = require("winston");

// Define the Winston logger configuration
const logger = winston.createLogger({
 
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

module.exports = logger;
