const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['booking_confirmed', 'event_updated', 'event_cancelled', 'new_follower', 'system'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // event or booking ID
    },
    relatedModel: {
      type: String,
      enum: ['Event', 'Booking', 'User'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for user's notifications
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
