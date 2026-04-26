const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['music', 'tech', 'sports', 'arts', 'food', 'business', 'other'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    tags: [{ type: String, trim: true }],
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for filtering
eventSchema.index({ category: 1, date: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ 'location.city': 1 });

// Virtual for ticket types
eventSchema.virtual('ticketTypes', {
  ref: 'TicketType',
  localField: '_id',
  foreignField: 'event',
});

// Don't return soft-deleted events
eventSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Event', eventSchema);
