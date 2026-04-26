const express = require('express');
const router = express.Router();
const { getAdminStats, getOrganizerStats, getAllUsers, updateUserRole, banUser } = require('../controllers/dashboardController');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Admin routes
router.get('/admin/stats', verifyToken, checkRole('admin'), getAdminStats);
router.get('/admin/users', verifyToken, checkRole('admin'), getAllUsers);
router.put('/admin/users/:id/role', verifyToken, checkRole('admin'), updateUserRole);
router.put('/admin/users/:id/ban', verifyToken, checkRole('admin'), banUser);

// Organizer routes
router.get('/organizer/stats', verifyToken, checkRole('organizer', 'admin'), getOrganizerStats);

// Notification routes
router.get('/notifications', verifyToken, getNotifications);
router.put('/notifications/:id/read', verifyToken, markAsRead);
router.put('/notifications/read-all', verifyToken, markAllAsRead);

module.exports = router;
