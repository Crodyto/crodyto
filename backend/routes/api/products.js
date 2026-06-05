const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  seedProducts
} = require('../../controllers/productController');
const { addReview, getReviews } = require('../../controllers/reviewController');

const auth = require('../../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/seed', seedProducts);
router.get('/:id/reviews', getReviews);
router.get('/:id', getProductById);
router.post('/', auth, createProduct);
router.post('/:id/reviews', auth, addReview);

module.exports = router;
