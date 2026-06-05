const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const admin = require('../../middleware/adminMiddleware');
const adminCtrl = require('../../controllers/adminController');
const couponCtrl = require('../../controllers/couponController');

// stats
router.get('/stats', auth, admin, adminCtrl.stats);

// users
router.get('/users', auth, admin, adminCtrl.listUsers);
router.put('/users/:id/block', auth, admin, adminCtrl.blockUser);
router.put('/users/:id/role', auth, admin, adminCtrl.setUserRole);

// orders
router.get('/orders', auth, admin, adminCtrl.listOrders);
router.put('/orders/:id/status', auth, admin, adminCtrl.updateOrderStatus);
router.get('/orders/export/csv', auth, admin, adminCtrl.exportOrdersCsv);

// products
router.get('/products', auth, admin, adminCtrl.listProducts);
router.post('/products', auth, admin, adminCtrl.createProduct);
router.put('/products/:id', auth, admin, adminCtrl.updateProduct);
router.delete('/products/:id', auth, admin, adminCtrl.deleteProduct);

// categories
router.get('/categories', auth, admin, adminCtrl.listCategories);
router.post('/categories', auth, admin, adminCtrl.createCategory);
router.put('/categories/:id', auth, admin, adminCtrl.updateCategory);
router.delete('/categories/:id', auth, admin, adminCtrl.deleteCategory);

// coupons
router.get('/coupons', auth, admin, couponCtrl.getCoupons);
router.post('/coupons', auth, admin, couponCtrl.createCoupon);
router.put('/coupons/:id', auth, admin, couponCtrl.updateCoupon);
router.delete('/coupons/:id', auth, admin, couponCtrl.deleteCoupon);

module.exports = router;
