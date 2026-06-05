const Notification = require('../models/Notification');
const User = require('../models/User');
const axios = require('axios');

async function sendFcm(fcmToken, payload) {
  const key = process.env.FIREBASE_SERVER_KEY;
  if (!key || !fcmToken) return null;
  try {
    const res = await axios.post('https://fcm.googleapis.com/fcm/send', {
      to: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {}
    }, {
      headers: { Authorization: `key=${key}` }
    });
    return res.data;
  } catch (err) {
    console.error('FCM send error', err.message);
    return null;
  }
}

// POST /api/notifications  { userId?, title, body, type, data }
// if userId omitted, broadcast to all users (creates DB entries for each)
exports.sendNotification = async (req, res, next) => {
  try {
    const { userId, title, body, type, data } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });

    const payload = { title, body, type, data };

    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const n = await Notification.create({ user: user._id, title, body, type, data });
      // try FCM if token exists
      if (user.fcmToken) await sendFcm(user.fcmToken, payload);
      return res.status(201).json(n);
    }

    // broadcast: create notifications for all users (lightweight)
    const users = await User.find().select('_id fcmToken');
    const created = [];
    for (const u of users) {
      const n = await Notification.create({ user: u._id, title, body, type, data });
      if (u.fcmToken) {
        // fire and forget
        sendFcm(u.fcmToken, payload).catch(() => {});
      }
      created.push(n);
    }
    res.status(201).json({ count: created.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(limit);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    if (n.user.toString() !== req.userId.toString()) return res.status(403).json({ message: 'Not authorized' });
    n.read = true;
    await n.save();
    res.json(n);
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
