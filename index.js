// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const serverless = require("serverless-http");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Success!" });
});

// Payment creation endpoint
app.post("/payment/create", async (req, res) => {
  const total = parseInt(req.query.total) * 100; // convert dollars to cents

  if (!total || total <= 0) {
    return res.status(400).json({ message: "Total must be greater than 0" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
    });

    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: "Payment failed" });
  }
});

// Export for Vercel serverless
if (process.env.VERCEL) {
  module.exports.handler = serverless(app);
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Amazon server running on :${PORT}, http://localhost:${PORT}`);
  });
}
