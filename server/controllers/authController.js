const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { apiResponse, generateOTP } = require('../utils/helpers');
const emailService = require('../services/emailService');

// Generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  // Only allow attendee and organizer roles during registration
  const allowedRoles = ['attendee', 'organizer'];
  const userRole = allowedRoles.includes(role) ? role : 'attendee';

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return apiResponse(res, 201, 'Registration successful', {
    user,
    accessToken,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (user.isBanned) {
    return next(new AppError('Your account has been banned. Contact support.', 403));
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return apiResponse(res, 200, 'Login successful', {
    user,
    accessToken,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = asyncHandler(async (req, res, next) => {
  // Clear refresh token from DB
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  // Clear cookie
  res.clearCookie('refreshToken');

  return apiResponse(res, 200, 'Logged out successfully');
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Cookie
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return next(new AppError('No refresh token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Token rotation: generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return apiResponse(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

/**
 * @desc    Forgot password - send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  user.resetOTP = hashedOTP;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  try {
    await emailService.sendOTPEmail(user.email, user.name, otp);
    return apiResponse(res, 200, 'OTP sent to your email');
  } catch (error) {
    user.resetOTP = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send email. Try again later.', 500));
  }
});

/**
 * @desc    Reset password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    resetOTP: hashedOTP,
    otpExpiry: { $gt: Date.now() },
  }).select('+resetOTP +otpExpiry');

  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  user.password = newPassword;
  user.resetOTP = undefined;
  user.otpExpiry = undefined;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  return apiResponse(res, 200, 'Password reset successful. Please login again.');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res, next) => {
  return apiResponse(res, 200, 'User profile', { user: req.user });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
};
