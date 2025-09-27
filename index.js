// Load env vars first
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const serverless = require("serverless-http");

const app = express();

// Debug log (remove in production)
console.log("Stripe Key Loaded:", process.env.STRIPE_KEY ? "✅ Yes" : "❌ No");

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Payment creation endpoint
app.post("/payment/create", async (req, res) => {
  try {
    const total = parseInt(req.query.total);

    if (!total || total <= 0) {
      return res.status(400).json({ message: "Total must be greater than 0" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Convert dollars → cents
      currency: "usd",
    });

    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: err.message || "Payment failed" });
  }
});

// Vercel serverless export
if (process.env.VERCEL) {
  module.exports = app;
  module.exports.handler = serverless(app);
} else {
  // Local development
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Amazon server running at http://localhost:${PORT}`);
  });
}
