const twilio = require('twilio');

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send SMS via Twilio (silently skips if not configured)
 */
const sendSMS = async (to, message) => {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) return;
  if (!to) return;
  try {
    // Ensure E.164 format for India (+91XXXXXXXXXX)
    const phone = to.startsWith('+') ? to : `+91${to}`;
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`📱 SMS sent to ${phone}`);
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};

exports.sendOrderSMS = async (phone, orderData) => {
  const msg = `Hi ${orderData.name}! Your order #${orderData.orderId} for ₹${orderData.total} has been placed. Track at ${process.env.CLIENT_URL}/order/${orderData.orderId}`;
  await sendSMS(phone, msg);
};

exports.sendStatusSMS = async (phone, orderData) => {
  const msg = `Order #${orderData.orderId} update: Status is now "${orderData.status}". Track at ${process.env.CLIENT_URL}/order/${orderData.orderId}`;
  await sendSMS(phone, msg);
};
