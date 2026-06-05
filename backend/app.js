const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/api/auth');
const productRoutes = require('./routes/api/products');
const couponRoutes = require('./routes/api/coupons');
const orderRoutes = require('./routes/api/orders');

const userRoutes = require('./routes/api/users');
const wishlistRoutes = require('./routes/api/wishlist');
const notificationRoutes = require('./routes/api/notifications');
const adminRoutes = require('./routes/api/admin');
const settingsRoutes = require('./routes/api/settings');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// allow common local dev ports plus configured CLIENT_URL
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g. curl, server-to-server)
      if (!origin) return callback(null, true);
      // allow configured client URL or any localhost dev origin
      if (origin === CLIENT_URL) return callback(null, true);
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.get('/', (req, res) => res.json({ message: 'MERN Ecommerce API' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
