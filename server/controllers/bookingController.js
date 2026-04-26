const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { apiResponse } = require('../utils/helpers');
const qrService = require('../services/qrService');

const createBooking = asyncHandler(async (req, res, next) => {
  const { eventId, tickets } = req.body;
  const event = await Event.findById(eventId);
  if (!event || event.status !== 'published') {
    return next(new AppError('Event not available for booking', 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalAmount = 0;
    const bookingTickets = [];
    for (const ticket of tickets) {
      const ticketType = await TicketType.findById(ticket.ticketTypeId).session(session);
      if (!ticketType) throw new AppError('Ticket type not found', 400);
      if (ticketType.available < ticket.quantity) {
        throw new AppError(`Not enough ${ticketType.name} tickets. Only ${ticketType.available} left.`, 400);
      }
      ticketType.quantitySold += ticket.quantity;
      await ticketType.save({ session });
      totalAmount += ticketType.price * ticket.quantity;
      bookingTickets.push({ ticketType: ticketType._id, quantity: ticket.quantity, price: ticketType.price });
    }
    const booking = await Booking.create([{
      user: req.user._id, event: eventId, tickets: bookingTickets,
      totalAmount, status: 'pending', lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
    }], { session });
    await session.commitTransaction();
    return apiResponse(res, 201, 'Booking created. Complete payment within 15 minutes.', { booking: booking[0] });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({ path: 'event', select: 'title date location image category' })
    .populate({ path: 'tickets.ticketType', select: 'name price' })
    .sort({ createdAt: -1 });
  return apiResponse(res, 200, 'Your bookings', { bookings });
});

const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }
  if (['cancelled', 'refunded'].includes(booking.status)) {
    return next(new AppError('Booking already cancelled', 400));
  }
  for (const ticket of booking.tickets) {
    await TicketType.findByIdAndUpdate(ticket.ticketType, { $inc: { quantitySold: -ticket.quantity } });
  }
  booking.status = 'cancelled';
  await booking.save();
  return apiResponse(res, 200, 'Booking cancelled successfully');
});

const getBookingQR = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  if (booking.user.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
  if (booking.status !== 'confirmed') return next(new AppError('QR only for confirmed bookings', 400));
  if (!booking.qrCode) {
    booking.qrCode = await qrService.generateBookingQR(booking._id);
    await booking.save();
  }
  return apiResponse(res, 200, 'QR Code', { qrCode: booking.qrCode });
});

module.exports = { createBooking, getMyBookings, cancelBooking, getBookingQR };
