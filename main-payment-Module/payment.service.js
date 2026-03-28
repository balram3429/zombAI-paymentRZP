// modules/payment/payment.service.js
const crypto = require('crypto');
const { razorpay } = require('../../config/env');

/**
 * Verifies the payment signature returned by Razorpay after checkout.
 *
 * Razorpay's signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
 * This proves the payment response was not tampered with.
 */
const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const message  = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', razorpay.keySecret)
    .update(message)
    .digest('hex');

  return expected === razorpay_signature;
};

module.exports = { verifyPaymentSignature };
