const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc Get all products with search, filter, sort, pagination
exports.getProducts = async (req, res) => {
  try {
    const { keyword, category, sort, page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const query = {};

    if (keyword) query.name = { $regex: keyword, $options: 'i' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOption =
      sort === 'price_asc' ? { price: 1 } :
      sort === 'price_desc' ? { price: -1 } :
      sort === 'rating' ? { rating: -1 } :
      { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getProducts error:', err.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, isFeatured } = req.body;
    let image = '', imagePublicId = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'general-store' });
      image = result.secure_url;
      imagePublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    } else if (req.body.imageUrl) {
      image = req.body.imageUrl;
    }

    const product = await Product.create({ name, description, price, category, stock, image, imagePublicId, isFeatured });
    res.status(201).json(product);
  } catch (err) {
    console.error('createProduct error:', err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message || 'Server error creating product' });
  }
};

// @desc Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, category, stock, isFeatured } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    if (req.file) {
      if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId);
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'general-store' });
      product.image = result.secure_url;
      product.imagePublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    } else if (req.body.imageUrl) {
      product.image = req.body.imageUrl;
      product.imagePublicId = '';
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error('updateProduct error:', err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId);
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// @desc Add review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment)
      return res.status(400).json({ message: 'Rating and comment are required' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: 'You have already reviewed this product' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.updateRating();
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error adding review' });
  }
};

// @desc Get featured products
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get low stock products (admin)
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } }).select('name stock category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
