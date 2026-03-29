const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmation, sendStatusUpdate } = require('../utils/sendEmail');
const { sendOrderSMS, sendStatusSMS } = require('../utils/sendSMS');
const generateInvoice = require('../utils/generateInvoice');

// @desc Place order
exports.placeOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: 'No order items' });

    // Validate and reduce stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paymentMethod !== 'COD',
      paidAt: paymentMethod !== 'COD' ? new Date() : undefined,
    });

    const io = req.app.get('io');
    if (io) io.emit('newOrder', { orderId: order._id, userId: req.user._id });

    // Send email + SMS (non-blocking)
    sendOrderConfirmation(req.user, order).catch((e) => console.error('Email error:', e.message));
    const fullUser = await User.findById(req.user._id).select('phone');
    if (fullUser?.phone) {
      sendOrderSMS(fullUser.phone, { name: req.user.name, orderId: order._id, total: order.totalPrice })
        .catch((e) => console.error('SMS error:', e.message));
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('placeOrder error:', err.message);
    res.status(500).json({ message: err.message || 'Server error placing order' });
  }
};

// @desc Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status;
    if (req.body.status === 'Delivered') {
      order.deliveredAt = new Date();
      order.isPaid = true;
      order.paidAt = order.paidAt || new Date();
    }
    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('orderStatusUpdate', { orderId: order._id, status: order.status });

    sendStatusUpdate(order.user, order).catch((e) => console.error('Email error:', e.message));
    if (order.user?.phone) {
      sendStatusSMS(order.user.phone, { orderId: order._id, status: order.status })
        .catch((e) => console.error('SMS error:', e.message));
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// @desc Download invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    generateInvoice(order, req.user, res);
  } catch (err) {
    res.status(500).json({ message: 'Server error generating invoice' });
  }
};

// @desc Admin dashboard analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    const lowStock = await Product.find({ stock: { $lte: 10 } }).select('name stock');

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
      lowStock,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};
