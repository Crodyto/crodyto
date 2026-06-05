const Review = require('../models/Review');
const Product = require('../models/Product');

// POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating is required' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let name = 'Anonymous';
    if (req.userId) {
      try {
        const User = require('../models/User');
        const u = await User.findById(req.userId).select('name');
        if (u) name = u.name || name;
      } catch (e) {
        // ignore
      }
    }

    const review = await Review.create({
      product: id,
      user: req.userId,
      name,
      rating: Number(rating),
      comment
    });

    // recalc rating and numReviews
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length) {
      product.rating = stats[0].avg;
      product.numReviews = stats[0].count;
    } else {
      product.rating = 0;
      product.numReviews = 0;
    }
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ product: id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
