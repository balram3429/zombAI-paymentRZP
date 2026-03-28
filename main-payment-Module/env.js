// config/env.js
require('dotenv').config();

const required = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'EBOOK_DOWNLOAD_URL',
  'EBOOK_TITLE',
  'SELLER_NAME',
];

required.forEach((key) => {
  if (!process.env[key]) throw new Error(`❌ Missing env variable: ${key}`);
});

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL || '*',
  razorpay: {
    keyId:     process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  email: {
    user:        process.env.GMAIL_USER,
    appPassword: process.env.GMAIL_APP_PASSWORD,
  },
  product: {
    title:       process.env.EBOOK_TITLE,
    downloadUrl: process.env.EBOOK_DOWNLOAD_URL,
    sellerName:  process.env.SELLER_NAME,
    amountPaise: parseInt(process.env.PRODUCT_AMOUNT_PAISE) || 49900,
  },
};
