const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, getBookingQR } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

router.post('/create', verifyToken, createBooking);
router.get('/my', verifyToken, getMyBookings);
router.post('/:id/cancel', verifyToken, cancelBooking);
router.get('/:id/qr', verifyToken, getBookingQR);

module.exports = router;
