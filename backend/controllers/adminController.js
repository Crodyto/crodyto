const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// GET /api/admin/stats
exports.stats = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalSales = (totalSalesAgg[0] && totalSalesAgg[0].total) || 0;

    // sales by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const salesByDayAgg = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalPrice' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ usersCount, ordersCount, productsCount, totalSales, salesByDay: salesByDayAgg });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(200);
    res.json(users);
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/block
exports.blockUser = async (req, res, next) => {
  try {
    const { action } = req.body; // 'block' or 'unblock'
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.blocked = action === 'block';
    await user.save();
    // create notification
    await Notification.create({ user: user._id, title: `Account ${user.blocked? 'blocked' : 'unblocked' }`, body: `Your account was ${user.blocked? 'blocked':'unblocked' } by admin.` });
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/role
exports.setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user','sub-admin','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    user.isAdmin = role === 'admin';
    await user.save();
    await Notification.create({ user: user._id, title: `Role changed`, body: `Your role was set to ${role}` });
    const out = user.toObject(); delete out.password;
    res.json(out);
  } catch (err) { next(err); }
};

// GET /api/admin/orders
exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch (err) { next(err); }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, date: new Date() });
    await order.save();
    // notify user
    if (order.user) {
      await Notification.create({ user: order.user._id, title: `Order ${order._id} status`, body: `Status updated to ${status}`, data: { orderId: order._id } });
      // try FCM send if user has token
      if (order.user.fcmToken) {
        const axios = require('axios');
        const key = process.env.FIREBASE_SERVER_KEY;
        if (key) {
          axios.post('https://fcm.googleapis.com/fcm/send', { to: order.user.fcmToken, notification: { title: `Order ${order._id}`, body: `Status: ${status}` }, data: { orderId: order._id } }, { headers: { Authorization: `key=${key}` } }).catch(()=>{});
        }
      }
    }
    res.json(order);
  } catch (err) { next(err); }
};

// Product CRUD
exports.listProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(500);
    res.json(products);
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// categories via Category model
const Category = require('../models/Category');
exports.listCategories = async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) { next(err); }
};
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const c = await Category.create({ name, slug });
    res.status(201).json(c);
  } catch (err) { next(err); }
};
exports.updateCategory = async (req, res, next) => {
  try {
    const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(c);
  } catch (err) { next(err); }
};
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// CSV report for orders
exports.exportOrdersCsv = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    const rows = [['orderId','user','email','totalPrice','status','createdAt']];
    for (const o of orders) rows.push([o._id, o.user?.name||'', o.user?.email||'', o.totalPrice, o.status, o.createdAt.toISOString()]);
    const csv = rows.map(r=> r.map(c=> '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="orders.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};
