const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Requested', 'Processing', 'Completed', 'Rejected'],
      default: 'Requested',
    },
    gatewayRefundId: { type: String, default: '' }, // Razorpay/Stripe refund ID
    method: { type: String, default: '' },          // Razorpay | Stripe
  },
  { timestamps: true }
);

module.exports = mongoose.model('Refund', refundSchema);
