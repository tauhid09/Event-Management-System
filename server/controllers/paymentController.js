const stripe = require('../config/stripe');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { apiResponse } = require('../utils/helpers');
const qrService = require('../services/qrService');
const emailService = require('../services/emailService');

const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate('event', 'title');
  if (!booking) return next(new AppError('Booking not found', 404));
  if (booking.user.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
  if (booking.status !== 'pending') return next(new AppError('Booking is not pending payment', 400));
  if (booking.lockedUntil && booking.lockedUntil < new Date()) {
    return next(new AppError('Booking lock expired. Please create a new booking.', 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount * 100),
    currency: 'usd',
    metadata: { bookingId: booking._id.toString(), userId: req.user._id.toString() },
  });

  booking.chargeId = paymentIntent.id;
  await booking.save();
  return apiResponse(res, 200, 'Payment intent created', { clientSecret: paymentIntent.client_secret });
});

const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const booking = await Booking.findOne({ chargeId: paymentIntent.id })
      .populate('user', 'name email')
      .populate('event', 'title date location');
    if (booking && booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.qrCode = await qrService.generateBookingQR(booking._id);
      await booking.save();
      try {
        await emailService.sendBookingConfirmation(booking.user.email, booking.user.name, booking);
      } catch (e) { console.error('Email send failed:', e.message); }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const booking = await Booking.findOne({ chargeId: paymentIntent.id });
    if (booking) { booking.status = 'cancelled'; await booking.save(); }
  }

  res.json({ received: true });
});

module.exports = { createPaymentIntent, handleWebhook };
