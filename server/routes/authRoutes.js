const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', verifyToken, getMe);

module.exports = router;
