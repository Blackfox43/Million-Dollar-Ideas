import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Stripe helper with lazy check to prevent startup crashes
const getStripeInstance = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim() === "" || secretKey === "YOUR_STRIPE_SECRET_KEY") {
    return null;
  }
  return new Stripe(secretKey);
};

// API: Stripe Checkout Session Creation
app.post("/api/payments/create-checkout-session", async (req, res) => {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(200).json({
        error: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is currently in Sandbox/Simulator mode because STRIPE_SECRET_KEY is not defined in environment variables."
      });
    }

    const hostUrl = process.env.APP_URL || req.headers.referer || "http://localhost:3000";
    // Strip trailing slash if present
    const cleanHostUrl = hostUrl.endsWith("/") ? hostUrl.slice(0, -1) : hostUrl;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Million Dollar Ideas - Creator Subscription",
              description: "Lifetime access to 1,000+ elite side-hustle concepts, custom filters, and white-label card exports.",
            },
            unit_amount: 900, // $9.00 USD
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${cleanHostUrl}?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cleanHostUrl}?checkout_cancel=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating stripe session:", error);
    res.status(500).json({ error: "STRIPE_ERROR", message: error.message });
  }
});

// API: Verify Stripe Session
app.get("/api/payments/verify-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(400).json({ error: "STRIPE_NOT_CONFIGURED", message: "Stripe key is missing." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      res.json({ success: true, payment_status: session.payment_status });
    } else {
      res.json({ success: false, payment_status: session.payment_status, message: "Payment has not been completed." });
    }
  } catch (error: any) {
    console.error("Error verifying stripe session:", error);
    res.status(500).json({ error: "STRIPE_ERROR", message: error.message });
  }
});

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", stripeConfigured: !!getStripeInstance() });
});

// Setup Vite or Static assets middleware
async function setupViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static asset serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupViteMiddleware().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to setup Vite middleware:", err);
});
