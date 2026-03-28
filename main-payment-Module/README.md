# 📖 Ebook Payment System — Developer Guide

Full-stack ebook payment + delivery system for the Indian market.
**Razorpay checkout → signature verification → Gmail delivery.**

---

## How It Works

```
index.html (Buy Now button)
      │
      ▼  POST /api/create-order
server.js → order.service.js → Razorpay API → returns orderId
      │
      ▼  Razorpay Checkout opens (UPI · Cards · Net Banking · Wallets)
      │
      ▼  User pays → Razorpay returns { order_id, payment_id, signature }
      │
      ▼  POST /api/verify-payment
payment.service.js → HMAC-SHA256 verify → ✅ valid
      │
      ▼  email.service.js → Nodemailer → Gmail → buyer receives download link
```

---

## Folder Structure

```
ebook-payment/
├── index.html                          # Landing page + Buy Now button
├── server.js                           # Entry point
├── app.js                              # Express routes
├── config/
│   └── env.js                          # Env loader + validation
├── modules/
│   ├── order/
│   │   └── order.service.js            # Creates Razorpay order (paise, INR)
│   ├── payment/
│   │   └── payment.service.js          # Verifies HMAC-SHA256 signature
│   └── email/
│       └── email.service.js            # HTML email with download button
├── tests/
│   └── payment.test.js                 # Unit + API tests
├── .env.example
└── package.json
```

---

## API Reference

### `POST /api/create-order`

Called when user clicks **Buy Now**. Creates a Razorpay order.

**Response:**
```json
{ "orderId": "order_xxx", "amount": 49900, "currency": "INR" }
```

---

### `POST /api/verify-payment`

Called after Razorpay checkout succeeds. Verifies signature + sends email.

**Request body:**
```json
{
  "razorpay_order_id":   "order_xxx",
  "razorpay_payment_id": "pay_yyy",
  "razorpay_signature":  "hmac_signature",
  "email": "buyer@example.com",
  "name":  "Buyer Name"
}
```

**Response:**
```json
{ "success": true, "email": "buyer@example.com" }
```

---

## Setup

```bash
git clone <your-repo>
cd ebook-payment
npm install
cp .env.example .env    # fill in all values
npm run dev             # starts on port 3000 + serves index.html
```

Then open: **http://localhost:3000**

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `RAZORPAY_KEY_ID` | From razorpay.com → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Same page as above — keep this secret |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | 16-char App Password (not your main password) |
| `SELLER_NAME` | Your name, shown in email footer |
| `EBOOK_TITLE` | Product name shown in email subject |
| `EBOOK_DOWNLOAD_URL` | Google Drive / CDN link to your PDF |
| `PRODUCT_AMOUNT_PAISE` | Price in paise — ₹499 = `49900` |
| `FRONTEND_URL` | Your landing page domain (for CORS) |

---

## Gmail App Password Setup

1. Go to **myaccount.google.com/security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Select "Mail" → "Other"
4. Copy the 16-character password → set as `GMAIL_APP_PASSWORD`

---

## Razorpay Setup

1. Sign up at **razorpay.com** (free, instant KYC for Indian sellers)
2. Get **Test Keys** from Settings → API Keys (start with `rzp_test_`)
3. Copy `RAZORPAY_KEY_ID` to both `.env` and `index.html` (`RAZORPAY_KEY_ID` constant)
4. Switch to **Live Keys** when going live

---

## Collecting Buyer Email from Razorpay

Razorpay's `handler` callback returns `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
It does **not** automatically return the buyer's email in the callback.

**Two options:**

**Option A — Prefill (easiest):** Ask for email before opening checkout:
```js
// In index.html, before calling startPayment():
const email = prompt('Enter your email to receive the ebook:');

// Add to Razorpay options:
prefill: { email, name: '' }

// In handler, pass email to verifyAndDeliver:
await verifyAndDeliver({ ...response, email });
```

**Option B — Fetch from Razorpay API (server-side):**
```js
// In /api/verify-payment, after signature verification:
const payment = await razorpayClient.payments.fetch(razorpay_payment_id);
const buyerEmail = payment.email;
```

---

## Running Tests

```bash
npm test
```

Tests cover:
- HMAC signature verification (valid + tampered)
- `POST /api/create-order` response shape
- `POST /api/verify-payment` — success flow + invalid signature rejection

---

## Deploying

| Target | Command |
|---|---|
| Local dev | `npm run dev` + ngrok for webhook testing |
| Railway | `railway up` — auto-detects Node, gives HTTPS URL |
| Render | Connect GitHub → Build: `npm install` → Start: `node server.js` |
| VPS/EC2 | `pm2 start server.js --name ebook-payment` |

Update `FRONTEND_URL` in `.env` to your deployed domain for CORS.
Update `RAZORPAY_KEY_ID` in `index.html` to your live key when ready.

---

## What's Next

- [ ] Add an email input field on the page so buyer email is captured before payment
- [ ] Log every purchase to a Google Sheet or SQLite DB
- [ ] Add WhatsApp delivery (AiSensy) alongside email
- [ ] Set up a webhook endpoint (`/webhook/razorpay`) as a fallback for missed payments
- [ ] Add a coupon / discount code field before checkout
- [ ] Move to Razorpay Payment Pages for a fully hosted checkout alternative
