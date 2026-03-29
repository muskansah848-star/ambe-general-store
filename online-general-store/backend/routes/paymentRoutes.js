const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect, adminOnly } = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const Refund = require('../models/Refund');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── STRIPE ──────────────────────────────────────────────
// @desc Create Stripe payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── RAZORPAY ────────────────────────────────────────────
// @desc Create Razorpay order
router.post('/razorpay/create-order', protect, async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Verify Razorpay payment signature
router.post('/razorpay/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  try {
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');
    if (expectedSign !== razorpay_signature)
      return res.status(400).json({ message: 'Invalid payment signature' });
    res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── COUPON ──────────────────────────────────────────────
// @desc Validate and apply coupon
router.post('/coupon/apply', protect, async (req, res) => {
  const { code, cartTotal } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return res.status(400).json({ message: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    if (cartTotal < coupon.minOrder)
      return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });

    let discount = coupon.type === 'percentage'
      ? Math.round((cartTotal * coupon.value) / 100)
      : coupon.value;

    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, cartTotal); // can't exceed cart total

    res.json({ discount, code: coupon.code, type: coupon.type, value: coupon.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Create coupon (admin)
router.post('/coupon', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc Get all coupons (admin)
router.get('/coupons', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Delete coupon (admin)
router.delete('/coupon/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── REFUND ──────────────────────────────────────────────
// @desc Request refund (customer)
router.post('/refund', protect, async (req, res) => {
  const { orderId, reason } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (!order.isPaid)
      return res.status(400).json({ message: 'Order was not paid — no refund needed' });

    const existing = await Refund.findOne({ order: orderId });
    if (existing) return res.status(400).json({ message: 'Refund already requested for this order' });

    const refund = await Refund.create({
      order: orderId,
      user: req.user._id,
      amount: order.totalPrice,
      reason,
      method: order.paymentMethod,
    });
    res.status(201).json(refund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Get my refunds (customer)
router.get('/refunds/my', protect, async (req, res) => {
  try {
    const refunds = await Refund.find({ user: req.user._id })
      .populate('order', 'totalPrice status createdAt')
      .sort({ createdAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Get all refunds (admin)
router.get('/refunds', protect, adminOnly, async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('user', 'name email')
      .populate('order', 'totalPrice paymentMethod paymentResult')
      .sort({ createdAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc Process refund (admin) — calls Razorpay/Stripe refund API
router.put('/refund/:id/process', protect, adminOnly, async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id).populate('order');
    if (!refund) return res.status(404).json({ message: 'Refund not found' });

    const { action } = req.body; // 'approve' | 'reject'

    if (action === 'reject') {
      refund.status = 'Rejected';
      await refund.save();
      return res.json(refund);
    }

    // Approve — call gateway
    const order = refund.order;
    let gatewayRefundId = '';

    if (order.paymentMethod === 'Razorpay' && order.paymentResult?.id) {
      const rzRefund = await razorpay.payments.refund(order.paymentResult.id, {
        amount: Math.round(refund.amount * 100),
      });
      gatewayRefundId = rzRefund.id;
    } else if (order.paymentMethod === 'Stripe' && order.paymentResult?.id) {
      const strRefund = await stripe.refunds.create({
        payment_intent: order.paymentResult.id,
        amount: Math.round(refund.amount * 100),
      });
      gatewayRefundId = strRefund.id;
    }

    refund.status = 'Completed';
    refund.gatewayRefundId = gatewayRefundId;
    await refund.save();

    // Mark order as refunded
    order.status = 'Cancelled';
    await order.save();

    res.json(refund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PAYMENT STATUS ──────────────────────────────────────
// @desc Get payment status for an order
router.get('/status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select(
      'isPaid paidAt paymentMethod paymentResult totalPrice status'
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json({
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentResult?.id || null,
      amount: order.totalPrice,
      orderStatus: order.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
