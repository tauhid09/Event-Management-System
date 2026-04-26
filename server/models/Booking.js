const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    tickets: [
      {
        ticketType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TicketType',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    chargeId: {
      type: String, // Stripe charge/payment intent ID
    },
    qrCode: {
      type: String, // base64 encoded QR code
    },
    lockedUntil: {
      type: Date, // 15-min payment lock
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ lockedUntil: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
