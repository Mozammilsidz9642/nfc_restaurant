import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import MenuItem from "./models/MenuItem";
import Order from "./models/Order";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

// 1. Menu Items Fetch API
app.get("/api/menu", async (_req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// 2. New Online Order Create API
app.post("/api/orders", async (req, res) => {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Missing required order details" });
    }

    const orderData = body as Record<string, unknown>;
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      items,
      totalAmount,
    } = orderData;

    const validItems =
      Array.isArray(items) &&
      items.length > 0 &&
      items.every((item: unknown) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return false;
        }

        const orderItem = item as Record<string, unknown>;
        return (
          typeof orderItem.name === "string" &&
          typeof orderItem.size === "string" &&
          typeof orderItem.price === "number" &&
          Number.isFinite(orderItem.price) &&
          typeof orderItem.quantity === "number" &&
          Number.isInteger(orderItem.quantity) &&
          orderItem.quantity > 0
        );
      });

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim() ||
      (customerEmail !== undefined && typeof customerEmail !== "string") ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim() ||
      !validItems ||
      typeof totalAmount !== "number" ||
      !Number.isFinite(totalAmount)
    ) {
      return res.status(400).json({ error: "Missing or invalid order details" });
    }

    const trackingToken = `NFC-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingUrl = `https://track.nfcorders.in/order/${trackingToken}`;

    const newOrder = new Order({
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      deliveryAddress,
      items,
      totalAmount,
      trackingUrl,
    });

    const savedOrder = await newOrder.save();

    console.log(
      `[New Order Received]: #${trackingToken} | Customer: ${customerName} | ₹${totalAmount}`
    );

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && customerEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Noida Fried Chicken" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: `Order Confirmed #${trackingToken} - Noida Fried Chicken`,
          html: `
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>Your order worth <b>₹${totalAmount}</b> is confirmed and being prepared fresh.</p>
            <p><b>Delivery Address:</b> ${deliveryAddress}</p>
            <p><b>Live Rider Tracking:</b> <a href="${trackingUrl}">${trackingUrl}</a></p>
            <hr/>
            <p>Estimated Delivery: 30 - 40 Minutes</p>
          `,
        });
      } catch (mailErr) {
        console.error("Mail error:", mailErr);
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: savedOrder._id,
      trackingToken,
      trackingUrl,
      order: savedOrder,
    });
  } catch (err) {
    console.error("Order Creation Error:", err);
    const message = err instanceof Error ? err.message : undefined;
    res.status(500).json({
      success: false,
      error: message || "Failed to place order",
    });
  }
});

// Database Connection & Server Listen
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));