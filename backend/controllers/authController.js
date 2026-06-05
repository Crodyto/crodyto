const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#222; padding:20px;">
        <h2 style="margin:0 0 10px">Your Verification Code</h2>
        <p style="font-size:20px; font-weight:700; letter-spacing:3px;">${code}</p>
        <p style="color:#666; font-size:13px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', to, 'messageId=', info.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send OTP email to', to, err);
    throw err;
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const user = await User.create({ name, email, phone, password, otp, otpExpires, isVerified: false });

    try {
      await sendOtpEmail(email, otp);
      res.status(201).json({ message: 'Registered. OTP sent for verification', userId: user._id });
    } catch (e) {
      // remove created user if email failed to send
      try { await User.findByIdAndDelete(user._id); } catch (delErr) { console.error('Failed to remove user after email failure', delErr); }
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
    }
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired or not set' });
    if (user.otp !== code) return res.status(400).json({ message: 'Invalid OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    if (!userId && !email) return res.status(400).json({ message: 'Missing userId or email' });

    const user = userId ? await User.findById(userId) : await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.isVerified = false;
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
      res.json({ message: 'OTP resent' });
    } catch (e) {
      // revert OTP fields on failure
      try { user.otp = undefined; user.otpExpires = undefined; await user.save(); } catch (revertErr) { console.error('Failed reverting OTP after email error', revertErr); }
      console.error('Failed to resend OTP email', e);
      return res.status(500).json({ message: 'Failed to resend OTP email. Please try again later.' });
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(403).json({ message: 'Email/phone not verified' });

    const token = generateToken(user._id);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const id = req.userId;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(id).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  // stateless JWT - just return success to client to clear token
  res.json({ message: 'Logged out' });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link was sent' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Mock sending reset link
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset?token=${token}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });

    let user = await User.findOne({ email });
    if (!user) {
      // create a user with a random password
      const random = crypto.randomBytes(8).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(random, salt);
      user = await User.create({ name: name || 'Google User', email, phone, password: hash, isVerified: true });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};
