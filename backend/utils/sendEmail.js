const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Ambe General Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

exports.sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.orderItems
    .map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price}</td></tr>`)
    .join('');

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed - #${order._id}`,
    html: `
      <h2>Thank you for your order, ${user.name}!</h2>
      <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>
      <table border="1" cellpadding="8" style="border-collapse:collapse">
        <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
        ${itemsHtml}
      </table>
      <p><strong>Total: ₹${order.totalPrice}</strong></p>
      <p>Payment Method: ${order.paymentMethod}</p>
    `,
  });
};

exports.sendStatusUpdate = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order Status Updated - #${order._id}`,
    html: `
      <h2>Hi ${user.name},</h2>
      <p>Your order <strong>#${order._id}</strong> status has been updated to: <strong>${order.status}</strong></p>
    `,
  });
};
