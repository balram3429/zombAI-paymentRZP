// modules/order/order.service.js
const Razorpay = require('razorpay');
const { razorpay, product } = require('../../config/env');

const client = new Razorpay({
  key_id:     razorpay.keyId,
  key_secret: razorpay.keySecret,
});

/**
 * Creates a Razorpay order.
 * The amount must match what is displayed on your page.
 * Razorpay requires amount in paise (₹499 = 49900 paise).
 */
const createOrder = async () => {
  const order = await client.orders.create({
    amount:   product.amountPaise,
    currency: 'INR',
    receipt:  `rcpt_${Date.now()}`,
    notes: {
      product: product.title,
    },
  });

  return {
    orderId:  order.id,
    amount:   order.amount,
    currency: order.currency,
  };
};

module.exports = { createOrder, client };
