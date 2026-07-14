/**
 * Send a standardized success API response
 * @param {Object} res - Express response object
 * @param {string} message - Status message
 * @param {Object} data - Payload data
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send a standardized error API response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Additional error details
 */
const sendError = (res, message = 'Error occurred', statusCode = 500, data = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data
  });
};

module.exports = {
  sendSuccess,
  sendError
};
