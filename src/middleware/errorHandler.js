const logger = require("../config/logger");

function errorHandler(err, req, res, next) {
  logger.error("Unhandled error: %o", err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message
  });
}

module.exports = errorHandler; 