import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";

// __filename and __dirname are not used

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let razorpay: Razorpay | null = null;

  const getRazorpay = () => {
    if (!razorpay) {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!key_id || !key_secret) {
        throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in environment variables.");
      }
      
      razorpay = new Razorpay({
        key_id,
        key_secret,
      });
    }
    return razorpay;
  };

  // API routes
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      const rzp = getRazorpay();
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt,
      };

      const order = await rzp.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create order" });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // In a real app, you would update the database here
        // But since we are using Supabase client-side, we'll return success
        // and let the client update the database (or ideally use a webhook)
        res.json({ status: "success" });
      } else {
        res.status(400).json({ status: "failure" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
