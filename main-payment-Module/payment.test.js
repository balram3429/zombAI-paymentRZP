// tests/payment.test.js
const crypto = require('crypto');

jest.mock('../config/env', () => ({
  port: 3000,
  frontendUrl: '*',
  razorpay: { keyId: 'rzp_test_key', keySecret: 'test_secret' },
  email: { user: 'test@test.com', appPassword: 'pass' },
  product: {
    title: 'Test Book',
    downloadUrl: 'https://example.com/book',
    sellerName: 'Tester',
    amountPaise: 49900,
  },
}));

jest.mock('../modules/order/order.service', () => ({
  createOrder: jest.fn().mockResolvedValue({
    orderId: 'order_test123',
    amount: 49900,
    currency: 'INR',
  }),
  client: {},
}));

jest.mock('../modules/email/email.service', () => ({
  sendEbookEmail: jest.fn().mockResolvedValue({ messageId: 'msg_001' }),
}));

const request = require('supertest');
const app     = require('../app');
const { verifyPaymentSignature } = require('../modules/payment/payment.service');
const { sendEbookEmail }         = require('../modules/email/email.service');

// Helper: generate a valid Razorpay signature
const makeSignature = (orderId, paymentId) =>
  crypto
    .createHmac('sha256', 'test_secret')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

// ── Unit: verifyPaymentSignature ─────────────────────────
describe('verifyPaymentSignature', () => {
  it('returns true for a correct signature', () => {
    const orderId   = 'order_abc';
    const paymentId = 'pay_xyz';
    const sig       = makeSignature(orderId, paymentId);

    expect(verifyPaymentSignature({
      razorpay_order_id:   orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature:  sig,
    })).toBe(true);
  });

  it('returns false for a tampered signature', () => {
    expect(verifyPaymentSignature({
      razorpay_order_id:   'order_abc',
      razorpay_payment_id: 'pay_xyz',
      razorpay_signature:  'bad_signature',
    })).toBe(false);
  });
});

// ── API: POST /api/create-order ──────────────────────────
describe('POST /api/create-order', () => {
  it('returns orderId, amount, and currency', async () => {
    const res = await request(app).post('/api/create-order');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      orderId:  'order_test123',
      amount:   49900,
      currency: 'INR',
    });
  });
});

// ── API: POST /api/verify-payment ───────────────────────
describe('POST /api/verify-payment', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns success and sends email for a valid payment', async () => {
    const orderId   = 'order_abc';
    const paymentId = 'pay_xyz';
    const sig       = makeSignature(orderId, paymentId);

    const res = await request(app)
      .post('/api/verify-payment')
      .send({
        razorpay_order_id:   orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature:  sig,
        email: 'buyer@test.com',
        name:  'Test Buyer',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendEbookEmail).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'buyer@test.com',
      paymentId:  paymentId,
    }));
  });

  it('returns 400 for an invalid signature', async () => {
    const res = await request(app)
      .post('/api/verify-payment')
      .send({
        razorpay_order_id:   'order_abc',
        razorpay_payment_id: 'pay_xyz',
        razorpay_signature:  'tampered',
        email: 'buyer@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(sendEbookEmail).not.toHaveBeenCalled();
  });
});
