const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, uploadEventImage, getMyEvents } = require('../controllers/eventController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getEvents);
router.get('/my-events', verifyToken, checkRole('organizer', 'admin'), getMyEvents);
router.get('/:id', getEvent);
router.post('/', verifyToken, checkRole('organizer', 'admin'), createEvent);
router.put('/:id', verifyToken, checkRole('organizer', 'admin'), updateEvent);
router.delete('/:id', verifyToken, checkRole('organizer', 'admin'), deleteEvent);
router.post('/:id/upload', verifyToken, checkRole('organizer', 'admin'), upload.single('image'), uploadEventImage);

module.exports = router;
