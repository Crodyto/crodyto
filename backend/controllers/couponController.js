const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, expiresAt } = req.body;
    const c = await Coupon.create({ code, discountPercent, expiresAt });
    res.status(201).json(c);
  } catch (err) { next(err); }
};

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { next(err); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(c);
  } catch (err) { next(err); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
