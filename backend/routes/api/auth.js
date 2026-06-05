const express = require('express');
const router = express.Router();
const {
	register,
	login,
	verifyOtp,
	forgotPassword,
	resetPassword,
	googleLogin,
	resendOtp,
	me,
	logout
} = require('../../controllers/authController');

const authMiddleware = require('../../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.post('/resend-otp', resendOtp);

module.exports = router;
