/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a standardized API response
 */
const apiResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode < 400,
    message,
  };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Paginate query results
 */
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

module.exports = { generateOTP, apiResponse, paginate };
