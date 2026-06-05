const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  qty: Number,
  price: Number,
  image: String
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: String,
    paymentResult: {},
    itemsPrice: Number,
    shippingPrice: Number,
    taxPrice: Number,
    totalPrice: Number,
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        note: String
      }
    ],
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
