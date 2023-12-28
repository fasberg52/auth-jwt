//services//logger.js
const winston = require("winston");

// Define the Winston logger configuration
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.printf(
      (info) =>
        `${info.timestamp} ${info.level}: ${info.message} ${
          info.error ? `\n${info.error}` : ""
        }`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

logger.error = (message, error) => {
  if (error) {
    const stack = error.stack || "";
    const stackLines = stack.split("\n").slice(1); 
    const stackInfo = stackLines.map((line) => line.trim()).join("\n");
    message = `${message}\n${stackInfo}`;
  }

  logger.log({ level: "error", message, error });
};

module.exports = logger;
