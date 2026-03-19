const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrder, getAllOrders,
  updateOrderStatus, downloadInvoice, getDashboardStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/dashboard', protect, adminOnly, getDashboardStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.get('/:id/invoice', protect, downloadInvoice);

module.exports = router;
