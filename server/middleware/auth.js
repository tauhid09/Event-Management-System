const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify JWT token and attach user to request
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    if (user.isBanned) {
      return next(new AppError('Your account has been banned.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token.', 401));
  }
});

/**
 * Check if user has required role(s)
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

/**
 * Optional auth - attach user if token present, continue regardless
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Token invalid, but we continue without user
    }
  }

  next();
});

module.exports = { verifyToken, checkRole, optionalAuth };
