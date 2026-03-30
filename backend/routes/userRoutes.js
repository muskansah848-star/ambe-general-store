const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

// GET /api/users — admin: list all users
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id/block — admin: toggle block
router.put('/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admin' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ isBlocked: user.isBlocked, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/analytics — admin: sales analytics
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Daily revenue for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const orders = await Order.find({ createdAt: { $gte: d, $lt: next }, status: { $ne: 'Cancelled' } });
      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: orders.reduce((s, o) => s + o.totalPrice, 0),
        orders: orders.length,
      });
    }

    // Monthly revenue for last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const orders = await Order.find({ createdAt: { $gte: start, $lt: end }, status: { $ne: 'Cancelled' } });
      last6Months.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: orders.reduce((s, o) => s + o.totalPrice, 0),
        orders: orders.length,
      });
    }

    // Top 5 selling products
    const allOrders = await Order.find({ status: { $ne: 'Cancelled' } });
    const productSales = {};
    allOrders.forEach((o) => {
      o.orderItems.forEach((item) => {
        const id = item.product?.toString() || item.name;
        if (!productSales[id]) productSales[id] = { name: item.name, qty: 0, revenue: 0 };
        productSales[id].qty += item.quantity;
        productSales[id].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Summary stats
    const totalOrders = await Order.countDocuments();
    const totalRevenue = allOrders.reduce((s, o) => s + o.totalPrice, 0);
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const thisMonthOrders = await Order.find({ createdAt: { $gte: startOfMonth }, status: { $ne: 'Cancelled' } });
    const lastMonthOrders = await Order.find({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }, status: { $ne: 'Cancelled' } });
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.totalPrice, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.totalPrice, 0);

    res.json({ last7Days, last6Months, topProducts, totalOrders, totalRevenue, totalUsers, thisMonthRevenue, lastMonthRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
