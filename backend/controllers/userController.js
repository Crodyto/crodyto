const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    await user.save();
    const out = await User.findById(req.userId).select('-password -otp -resetPasswordToken -resetPasswordExpires');
    res.json(out);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const { label, address, city, postalCode, country, phone } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const entry = { label, address, city, postalCode, country, phone };
    user.addresses = user.addresses || [];
    user.addresses.unshift(entry);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/addresses/:addrId
exports.updateAddress = async (req, res, next) => {
  try {
    const { addrId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const idx = user.addresses.findIndex((a) => a._id.toString() === addrId);
    if (idx === -1) return res.status(404).json({ message: 'Address not found' });
    const fields = ['label', 'address', 'city', 'postalCode', 'country', 'phone'];
    fields.forEach((f) => { if (req.body[f] != null) user.addresses[idx][f] = req.body[f]; });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/addresses/:addrId
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addrId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.addresses = user.addresses.filter((a) => a._id.toString() !== addrId);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};
