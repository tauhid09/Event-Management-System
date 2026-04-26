const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { apiResponse, paginate } = require('../utils/helpers');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Organizer, Admin
 */
const createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, category, date, endDate, location, tags, capacity, ticketTypes } = req.body;

  const event = await Event.create({
    title,
    description,
    category,
    date,
    endDate,
    location: typeof location === 'string' ? JSON.parse(location) : location,
    organizer: req.user._id,
    tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    capacity,
    status: 'draft',
  });

  // Create ticket types if provided
  if (ticketTypes) {
    const types = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
    const ticketDocs = types.map((t) => ({
      event: event._id,
      name: t.name,
      price: t.price,
      quantity: t.quantity,
      saleStart: t.saleStart,
      saleEnd: t.saleEnd,
    }));
    await TicketType.insertMany(ticketDocs);
  }

  const populated = await Event.findById(event._id)
    .populate('organizer', 'name email avatar')
    .populate('ticketTypes');

  return apiResponse(res, 201, 'Event created successfully', { event: populated });
});

/**
 * @desc    Get all events with search, filter, sort, pagination
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = asyncHandler(async (req, res, next) => {
  const { search, category, city, status, startDate, endDate, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  let query = {};

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (category) query.category = category;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (status) {
    query.status = status;
  } else {
    query.status = 'published'; // Default to published events
  }

  // Date range
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Sorting
  let sortObj = {};
  switch (sort) {
    case 'date_asc': sortObj = { date: 1 }; break;
    case 'date_desc': sortObj = { date: -1 }; break;
    case 'newest': sortObj = { createdAt: -1 }; break;
    case 'popular': sortObj = { capacity: -1 }; break;
    default: sortObj = { date: 1 };
  }

  const { skip, limit: lim } = paginate(page, limit);
  const total = await Event.countDocuments(query);

  const events = await Event.find(query)
    .populate('organizer', 'name email avatar')
    .populate('ticketTypes')
    .sort(sortObj)
    .skip(skip)
    .limit(lim);

  return apiResponse(res, 200, 'Events retrieved', {
    events,
    pagination: {
      page: parseInt(page),
      limit: lim,
      total,
      pages: Math.ceil(total / lim),
    },
  });
});

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email avatar phone')
    .populate('ticketTypes');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  return apiResponse(res, 200, 'Event details', { event });
});

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Organizer (own), Admin
 */
const updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check ownership
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this event', 403));
  }

  const updates = { ...req.body };
  if (updates.location && typeof updates.location === 'string') {
    updates.location = JSON.parse(updates.location);
  }
  if (updates.tags && typeof updates.tags === 'string') {
    updates.tags = JSON.parse(updates.tags);
  }

  event = await Event.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('organizer', 'name email avatar')
    .populate('ticketTypes');

  return apiResponse(res, 200, 'Event updated successfully', { event });
});

/**
 * @desc    Delete event (soft delete)
 * @route   DELETE /api/events/:id
 * @access  Organizer (own), Admin
 */
const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check ownership
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this event', 403));
  }

  event.isDeleted = true;
  event.status = 'cancelled';
  await event.save();

  return apiResponse(res, 200, 'Event deleted successfully');
});

/**
 * @desc    Upload event image
 * @route   POST /api/events/:id/upload
 * @access  Organizer (own), Admin
 */
const uploadEventImage = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  // Delete old image from Cloudinary if exists
  if (event.image.publicId) {
    await cloudinary.uploader.destroy(event.image.publicId);
  }

  // Upload to Cloudinary via stream
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'eventsync/events',
        transformation: [{ width: 1200, height: 630, crop: 'fill' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(req.file.buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });

  event.image = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };
  await event.save();

  return apiResponse(res, 200, 'Image uploaded successfully', { image: event.image });
});

/**
 * @desc    Get organizer's own events
 * @route   GET /api/events/my-events
 * @access  Organizer
 */
const getMyEvents = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { organizer: req.user._id };
  if (status) query.status = status;

  // Override the soft-delete filter for own events
  const { skip, limit: lim } = paginate(page, limit);
  const total = await Event.countDocuments(query);

  const events = await Event.find(query)
    .populate('ticketTypes')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(lim);

  return apiResponse(res, 200, 'Your events', {
    events,
    pagination: { page: parseInt(page), limit: lim, total, pages: Math.ceil(total / lim) },
  });
});

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  getMyEvents,
};
