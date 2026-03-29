const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

// GET /api/wishlist
router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.json(wishlist?.products || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/wishlist/:productId — toggle
router.post('/:productId', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

    const id = req.params.productId;
    const exists = wishlist.products.some((p) => p.toString() === id);
    if (exists) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== id);
    } else {
      wishlist.products.push(id);
    }
    await wishlist.save();
    res.json({ added: !exists, count: wishlist.products.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
      await wishlist.save();
    }
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
