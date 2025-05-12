const { createLogger, format, transports } = require("winston");
const path = require("path");

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const loggerTransports = [
  new transports.Console({
    level: process.env.LOG_LEVEL || "info",
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  })
];

if (process.env.NODE_ENV !== "production") {
  loggerTransports.push(
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      handleExceptions: true,
      handleRejections: true
    })
  );
  loggerTransports.push(
    new transports.File({
      filename: path.join("logs", "combined.log"),
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      handleExceptions: true,
      handleRejections: true
    })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: loggerTransports,
  exitOnError: false,
});

module.exports = logger; 