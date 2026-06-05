const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../../controllers/userController');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/addresses', auth, addAddress);
router.put('/addresses/:addrId', auth, updateAddress);
router.delete('/addresses/:addrId', auth, deleteAddress);

module.exports = router;
