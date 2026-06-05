const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const { sendNotification, getNotifications, markRead, markAllRead } = require('../../controllers/notificationController');

router.post('/', auth, sendNotification); // admin or server can post
router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markRead);
router.put('/read-all', auth, markAllRead);

module.exports = router;
