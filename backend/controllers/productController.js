const Product = require('../models/Product');

// GET /api/products
// Supports query params: q (search by name), minPrice, maxPrice, category, minRating, sort (price_asc|price_desc)
exports.getProducts = async (req, res, next) => {
  try {
    const { q, minPrice, maxPrice, category, minRating, sort } = req.query;

    const filter = {};

    if (q) {
      // case-insensitive partial match on name
      filter.name = { $regex: q, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null) filter.price.$gte = Number(minPrice);
      if (maxPrice != null) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const products = await query.exec();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, rating } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Missing fields' });

    const product = await Product.create({
      name,
      description,
      price,
      category,
      rating: rating != null ? Number(rating) : undefined,
      user: req.userId
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.seedProducts = async (req, res, next) => {
  try {
    const sample = [
      {
        name: 'Sample Product A',
        description: 'A great item',
        price: 19.99,
        category: 'Electronics',
        rating: 4.5,
        countInStock: 12,
        images: ['https://images.unsplash.com/photo-1510557880182-3d4d3e6b4f0f?w=800&q=60', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=60']
      },
      {
        name: 'Sample Product B',
        description: 'Another fine product',
        price: 29.99,
        category: 'Home',
        rating: 4.0,
        countInStock: 5,
        images: ['https://images.unsplash.com/photo-1505691723518-36a0f1d5b0c9?w=800&q=60']
      },
      {
        name: 'Budget Widget',
        description: 'Affordable & reliable',
        price: 9.99,
        category: 'Electronics',
        rating: 3.8,
        countInStock: 40,
        images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=60']
      },
      {
        name: 'Premium Gadget',
        description: 'Top-tier performance',
        price: 199.99,
        category: 'Electronics',
        rating: 4.9,
        countInStock: 3,
        images: ['https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=60']
      }
    ];
    await Product.deleteMany({});
    const created = await Product.insertMany(sample);
    res.json(created);
  } catch (err) {
    next(err);
  }
};
