const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/helpers');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  return apiResponse(res, 200, 'Notifications', { notifications, unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  return apiResponse(res, 200, 'Marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return apiResponse(res, 200, 'All notifications marked as read');
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
