const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, payOrder, getMyOrders, updateStatus } = require('../../controllers/orderController');
const auth = require('../../middleware/authMiddleware');

router.post('/', auth, createOrder);
router.get('/myorders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.post('/:id/pay', auth, payOrder);
router.patch('/:id/status', auth, updateStatus);

module.exports = router;
