const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wl = await Wishlist.findOne({ user: req.userId }).populate('products.product');
    if (!wl) return res.json({ products: [] });
    res.json(wl.products.map((p) => p.product));
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist  { productId }
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let wl = await Wishlist.findOne({ user: req.userId });
    if (!wl) wl = await Wishlist.create({ user: req.userId, products: [] });

    const exists = wl.products.some((p) => p.product.toString() === productId);
    if (exists) return res.status(200).json({ message: 'Already in wishlist' });

    wl.products.unshift({ product: productId });
    await wl.save();
    await wl.populate('products.product');
    res.status(201).json(wl.products.map((p) => p.product));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let wl = await Wishlist.findOne({ user: req.userId });
    if (!wl) return res.status(404).json({ message: 'Wishlist not found' });
    wl.products = wl.products.filter((p) => p.product.toString() !== productId);
    await wl.save();
    await wl.populate('products.product');
    res.json(wl.products.map((p) => p.product));
  } catch (err) {
    next(err);
  }
};
