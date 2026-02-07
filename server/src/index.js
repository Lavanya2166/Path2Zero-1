import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { verifyWebhook } from "@clerk/backend/webhooks";
import User from "./models/User.js";

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment");
}
if (!CLERK_SECRET_KEY) {
  throw new Error("Missing CLERK_SECRET_KEY in environment");
}
if (!CLERK_WEBHOOK_SIGNING_SECRET) {
  throw new Error("Missing CLERK_WEBHOOK_SIGNING_SECRET in environment");
}

await mongoose.connect(MONGODB_URI);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = await verifyWebhook(req, {
        signingSecret: CLERK_WEBHOOK_SIGNING_SECRET,
      });

      if (event.type === "user.created" || event.type === "user.updated") {
        const data = event.data;
        const email = data.email_addresses?.[0]?.email_address || "";
        const unsafe = data.unsafe_metadata || {};
        const name =
          unsafe.name ||
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          "";
        const phone = unsafe.phone || data.phone_numbers?.[0]?.phone_number || "";
        const role = unsafe.role || "";

        await User.findOneAndUpdate(
          { clerkUserId: data.id },
          { clerkUserId: data.id, email, name, phone, role },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid webhook signature" });
    }
  }
);

app.use(clerkMiddleware());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/me", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user });
});

app.patch("/api/me", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, phone, role } = req.body;
  const user = await User.findOneAndUpdate(
    { clerkUserId: userId },
    { $set: { name, phone, role } },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user });
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
