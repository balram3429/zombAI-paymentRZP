// app.js
const express   = require('express');
const cors      = require('cors');
const { frontendUrl } = require('./config/env');
const { createOrder } = require('./modules/order/order.service');
const { verifyPaymentSignature } = require('./modules/payment/payment.service');
const { sendEbookEmail } = require('./modules/email/email.service');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: frontendUrl }));
app.use(express.json());

// Serve the landing page statically (for local dev)
app.use(express.static(__dirname));

// ── Health ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── MODULE 1: Create Razorpay Order ────────────────────
// Called by the frontend when user clicks "Buy Now"
// Returns orderId that Razorpay checkout needs
app.post('/api/create-order', async (_req, res) => {
  try {
    const order = await createOrder();
    res.json(order);
  } catch (err) {
    console.error('create-order error:', err.message);
    res.status(500).json({ error: 'Could not create order' });
  }
});

// ── MODULE 2: Verify Payment + Deliver Ebook ───────────
// Called by the frontend after Razorpay checkout succeeds
// Verifies the signature, then emails the ebook
app.post('/api/verify-payment', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    // Razorpay passes these when prefill is set; otherwise collect via your own form
    email: buyerEmail,
    name:  buyerName,
  } = req.body;

  // 1. Verify the payment signature
  const isValid = verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!isValid) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature' });
  }

  // 2. Send ebook via email
  try {
    await sendEbookEmail({
      buyerName:  buyerName  || 'Valued Customer',
      buyerEmail: buyerEmail || '',
      paymentId:  razorpay_payment_id,
    });

    return res.json({ success: true, email: buyerEmail });
  } catch (err) {
    console.error('email send error:', err.message);
    // Payment succeeded — don't return 500. Log and alert manually.
    return res.json({ success: true, email: buyerEmail, emailWarning: 'delivery_delayed' });
  }
});

// ── 404 ─────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global Error Handler ─────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
