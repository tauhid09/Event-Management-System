const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { apiResponse } = require('../utils/helpers');

const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalEvents, totalBookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments({ isDeleted: false }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  const recentBookings = await Booking.find({ status: 'confirmed' })
    .populate('user', 'name email').populate('event', 'title')
    .sort({ createdAt: -1 }).limit(10);
  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $sort: { '_id': 1 } },
  ]);
  return apiResponse(res, 200, 'Admin dashboard stats', {
    stats: { totalUsers, totalEvents, totalBookings, totalRevenue },
    recentBookings, monthlyRevenue,
  });
});

const getOrganizerStats = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const events = await Event.find({ organizer: organizerId, isDeleted: false });
  const eventIds = events.map(e => e._id);
  const [totalBookings, revenueAgg] = await Promise.all([
    Booking.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
    Booking.aggregate([
      { $match: { event: { $in: eventIds }, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  const perEventStats = await Booking.aggregate([
    { $match: { event: { $in: eventIds }, status: 'confirmed' } },
    { $group: { _id: '$event', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
    { $unwind: '$event' },
    { $project: { eventTitle: '$event.title', bookings: 1, revenue: 1 } },
  ]);
  return apiResponse(res, 200, 'Organizer dashboard stats', {
    stats: { totalEvents: events.length, totalBookings, totalRevenue }, perEventStats,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(parseInt(limit));
  return apiResponse(res, 200, 'Users list', { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['admin', 'organizer', 'attendee'].includes(role)) return next(new AppError('Invalid role', 400));
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return next(new AppError('User not found', 404));
  return apiResponse(res, 200, 'User role updated', { user });
});

const banUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.isBanned = !user.isBanned;
  await user.save({ validateBeforeSave: false });
  return apiResponse(res, 200, `User ${user.isBanned ? 'banned' : 'unbanned'}`, { user });
});

module.exports = { getAdminStats, getOrganizerStats, getAllUsers, updateUserRole, banUser };
