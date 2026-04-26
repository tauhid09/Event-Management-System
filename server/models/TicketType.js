const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Ticket type name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    quantitySold: {
      type: Number,
      default: 0,
      min: 0,
    },
    saleStart: {
      type: Date,
    },
    saleEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available tickets
ticketTypeSchema.virtual('available').get(function () {
  return this.quantity - this.quantitySold;
});

// Ensure virtuals are included in JSON
ticketTypeSchema.set('toJSON', { virtuals: true });
ticketTypeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TicketType', ticketTypeSchema);
