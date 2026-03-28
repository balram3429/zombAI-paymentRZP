// server.js — Entry Point
require('./config/env'); // Validates env vars — crashes fast if missing
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `Server running on port ${PORT}`,
    endpoints: {
      health:        `GET  /health`,
      createOrder:   `POST /api/create-order`,
      verifyPayment: `POST /api/verify-payment`,
      landingPage:   `GET  /  (serves index.html)`,
    }
  }));
});
