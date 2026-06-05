const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice = 0, taxPrice = 0, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No order items' });

    const order = new Order({
      user: req.userId,
      orderItems: orderItems.map((i) => ({ product: i._id, name: i.name, qty: i.qty, price: i.price, image: i.images?.[0] })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // If card payment and Stripe configured, create PaymentIntent
    let clientSecret = null;
    if (paymentMethod === 'card' && process.env.STRIPE_SECRET) {
      try {
        const Stripe = require('stripe');
        const stripe = Stripe(process.env.STRIPE_SECRET);
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(totalPrice * 100),
          currency: 'usd',
          metadata: { orderId: order._id.toString() }
        });
        clientSecret = intent.client_secret;
      } catch (e) {
        // Stripe not available or error; fall through to mock
        clientSecret = null;
      }
    }

    // If paymentMethod is not card or stripe not configured, optionally mark paid for COD/mobile on server after webhook; for demo we'll keep isPaid=false
    const created = await order.save();
    res.status(201).json({ order: created, clientSecret });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/myorders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/:id/pay  (mock capture)
exports.payOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { id: req.body.id || 'mock_txn_' + Date.now(), status: 'COMPLETED', update_time: new Date().toISOString(), email_address: req.body.email };
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ message: 'Status required' });
    if (!['Pending', 'Shipped', 'Delivered'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // allow only owner or admin to update; for now allow owner
    if (order.user && req.userId && order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, date: new Date(), note });

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};
