const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.post('/create-intent', verifyToken, paymentLimiter, createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
