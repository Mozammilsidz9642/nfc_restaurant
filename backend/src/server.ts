import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import MenuItem from "./models/MenuItem";
import Order from "./models/Order";
import { Admin } from "./models/Admin";
import { StoreSettings } from "./models/StoreSettings";
import { sendOrderEmail } from "./utils/email";
import { sendOrderSMS } from "./utils/sms";
import { sendOrderWhatsApp } from "./utils/whatsapp";
import { protectManager, AuthRequest } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "nfc_super_secure_secret_key_2026";

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "";
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // Initialize Default Store Settings agar nahi hai toh
    const storeCount = await StoreSettings.countDocuments();
    if (storeCount === 0) {
      await StoreSettings.create({ isStoreOpen: true });
    }

    // Default Manager Admin agar nahi bana toh
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        username: "nfcmanager",
        password: "NfcPassword@123", // Baad mein dashboard se change ho sakta hai
        role: "manager",
      });
      console.log("Default Manager Created: username 'nfcmanager'");
    }
  })
  .catch((err) => console.error("MongoDB Error:", err));

// 1. PUBLIC: Get Menu
app.get("/api/menu", async (_req: Request, res: Response) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu items", error });
  }
});

// 2. PUBLIC: Get Store Status (Store Open/Closed?)
app.get("/api/store/status", async (_req: Request, res: Response) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) settings = await StoreSettings.create({ isStoreOpen: true });
    res.json({ success: true, isStoreOpen: settings.isStoreOpen, message: settings.closingMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch store status" });
  }
});

// 3. PUBLIC: Create Order (Customer side)
app.post("/api/orders", async (req: Request, res: Response): Promise<void> => {
  try {
    // Check Store Open hai ya nahi
    const settings = await StoreSettings.findOne();
    if (settings && !settings.isStoreOpen) {
      res.status(400).json({
        success: false,
        message: settings.closingMessage || "Restaurant is currently closed.",
      });
      return;
    }

    const { customerName, customerPhone, customerEmail, deliveryAddress, items, totalAmount } = req.body;

    if (!customerName || !customerPhone || !items || items.length === 0 || !totalAmount) {
      res.status(400).json({ success: false, message: "Missing required order fields" });
      return;
    }

    const orderIdToken = `NFC-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingUrl = `https://track.nfcorders.in/order/${orderIdToken}`;

    const newOrder = await Order.create({
      orderId: orderIdToken,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      deliveryAddress,
      items,
      totalAmount,
      status: "Placed",
      trackingUrl,
    });

    console.log(`[New Order Received]: #${orderIdToken} | Customer: ${customerName} | ₹${totalAmount}`);

    // Asynchronous Alerts
    sendOrderEmail(customerEmail, customerName, orderIdToken, totalAmount, trackingUrl).catch(console.error);
    sendOrderSMS(customerPhone, customerName, orderIdToken, totalAmount).catch(console.error);
    sendOrderWhatsApp(customerPhone, customerName, orderIdToken, totalAmount).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder._id,
      trackingToken: orderIdToken,
      trackingUrl,
      order: newOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Server error creating order", error });
  }
});

// 4. MANAGER AUTH: Login
app.post("/api/admin/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, JWT_SECRET, {
      expiresIn: "30d", // Manager baar baar phone pe log out na ho
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: { username: admin.username, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login error", error: err });
  }
});

// 5. MANAGER PROTECTED: Get All Orders (Filtered by status)
app.get("/api/admin/orders", protectManager, async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch orders" });
  }
});

// 6. MANAGER PROTECTED: Update Order Status (Placed -> Preparing -> Out for Delivery -> Delivered)
app.patch("/api/orders/:id/status", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, riderName, riderPhone } = req.body;
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (status) order.status = status;
    if (riderName) order.riderName = riderName;
    if (riderPhone) order.riderPhone = riderPhone;

    await order.save();
    console.log(`[Order Status Updated]: #${order.orderId} -> ${status}`);
    res.json({ success: true, message: `Status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update order status", error: err });
  }
});

// 7. MANAGER PROTECTED: Store Open/Close Toggle
app.post("/api/store/status", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { isStoreOpen, closingMessage } = req.body;

  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    if (typeof isStoreOpen === "boolean") settings.isStoreOpen = isStoreOpen;
    if (closingMessage) settings.closingMessage = closingMessage;
    settings.updatedAt = new Date();

    await settings.save();
    console.log(`[Store Status Changed]: Store is now ${settings.isStoreOpen ? "OPEN" : "CLOSED"}`);
    res.json({ success: true, isStoreOpen: settings.isStoreOpen, message: settings.closingMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update store status" });
  }
});

// 8. MANAGER PROTECTED: Toggle Item In-Stock / Out-of-Stock
app.patch("/api/menu/:id/stock", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { isAvailable } = req.body;
  const { id } = req.params;

  try {
    const item = await MenuItem.findById(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Item not found" });
      return;
    }

    item.isAvailable = isAvailable;
    await item.save();
    console.log(`[Menu Item Stock Changed]: ${item.name} -> Available: ${item.isAvailable}`);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update stock", error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
