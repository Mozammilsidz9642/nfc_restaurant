import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import bcrypt from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import MenuItem from "./models/MenuItem";
import Order from "./models/Order";
import Customer from "./models/Customer";
import { Manager } from "./models/Manager";
import { StoreSettings } from "./models/StoreSettings";
import { sendManagerPasswordResetOtp, sendOrderEmail, sendCustomerVerificationOtp } from "./utils/email";
import { sendOrderSMS } from "./utils/sms";
import { sendOrderWhatsApp } from "./utils/whatsapp";
import { dispatchShadowfaxOrder } from "./utils/shadowfax";
import { protectManager, AuthRequest } from "./middleware/auth";
import { realNFCMenu } from "./seed";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "nfc_super_secure_secret_key_2026");
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in production");
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

app.use(cors());
app.use(express.json());

interface InMemoryManagerRecord {
  id: string;
  _id: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  resetOtp?: string | null;
  resetOtpExpires?: Date | null;
  resetOtpAttempts?: number;
}

let inMemoryManager: InMemoryManagerRecord | null = null;
const inMemoryStore = {
  isStoreOpen: true,
  closingMessage: "Welcome to Noida Fried Chicken",
};
const inMemoryOrders: any[] = [];
interface CustomerOtpRecord {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}
const customerOtpMap = new Map<string, CustomerOtpRecord>();

interface InMemoryCustomerRecord {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  isEmailVerified: boolean;
  lastVerifiedAt: Date;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: Date;
}
const inMemoryCustomers: InMemoryCustomerRecord[] = [];

const inMemoryMenu = realNFCMenu.map((item, idx) => ({
  ...item,
  id: `nfc-item-${idx + 1}`,
  _id: `nfc-item-${idx + 1}`,
}));

const isLiveRazorpayConfigured = (): boolean => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return (
    !!keyId &&
    /^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId) &&
    !keyId.startsWith("rzp_test_sample") &&
    !!keySecret &&
    keySecret !== "dummy_secret" &&
    keySecret !== "sampleSecret123"
  );
};

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nfc_db";
mongoose.set("bufferCommands", false);
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    console.log("MongoDB Connected");

    // Initialize Menu items if database is empty
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      await MenuItem.insertMany(realNFCMenu);
      console.log("NFC Menu auto-seeded with", realNFCMenu.length, "items");
    }

    // Initialize Default Store Settings agar nahi hai toh
    const storeCount = await StoreSettings.countDocuments();
    if (storeCount === 0) {
      await StoreSettings.create({ isStoreOpen: true });
    }

  })
  .catch((err) => {
    console.warn("MongoDB Connection Warning (running in resilient mode):", err.message);
  });

// 1. PUBLIC: Get Menu
app.get("/api/menu", async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      let items = await MenuItem.find();
      if (items.length === 0) {
        await MenuItem.insertMany(realNFCMenu);
        items = await MenuItem.find();
      }
      res.json(items);
      return;
    }

    // Fallback menu when MongoDB is not connected
    res.json(inMemoryMenu);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu items", error });
  }
});

// 2. PUBLIC: Get Store Status (Store Open/Closed?)
app.get("/api/store/status", async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await StoreSettings.findOne();
      if (!settings) settings = await StoreSettings.create({ isStoreOpen: true });
      res.json({ success: true, isStoreOpen: settings.isStoreOpen, message: settings.closingMessage });
      return;
    }
    res.json({ success: true, isStoreOpen: true, message: "Welcome to Noida Fried Chicken" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch store status" });
  }
});

// 3. PUBLIC: Create a Razorpay order for online payment
app.post("/api/payment/create-order", async (req: Request, res: Response): Promise<void> => {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ success: false, message: "Invalid payment amount" });
      return;
    }

    const { itemsTotal, deliveryFee } = body as Record<string, unknown>;
    if (
      typeof itemsTotal !== "number" || !Number.isFinite(itemsTotal) || itemsTotal < 0 ||
      typeof deliveryFee !== "number" || !Number.isFinite(deliveryFee) || deliveryFee < 0 ||
      itemsTotal + deliveryFee <= 0
    ) {
      res.status(400).json({ success: false, message: "Invalid payment amount" });
      return;
    }

    let isStoreOpen = true;
    let closingMsg = "Restaurant is currently closed.";
    if (mongoose.connection.readyState === 1) {
      const settings = await StoreSettings.findOne();
      if (settings) {
        isStoreOpen = settings.isStoreOpen;
        if (settings.closingMessage) closingMsg = settings.closingMessage;
      }
    }

    if (!isStoreOpen) {
      res.status(400).json({
        success: false,
        message: closingMsg,
      });
      return;
    }

    const configuredKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const configuredKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const hasUsableCredentials =
      !!configuredKeyId &&
      /^rzp_(test|live)_[A-Za-z0-9]+$/.test(configuredKeyId) &&
      !configuredKeyId.startsWith("rzp_test_sample") &&
      !!configuredKeySecret &&
      configuredKeySecret !== "dummy_secret";

    if (!hasUsableCredentials) {
      const total = itemsTotal + deliveryFee;
      const timestamp = Date.now();
      console.log("[Mock Razorpay Order]: Razorpay credentials are missing or placeholders.");
      res.json({
        success: true,
        razorpayOrderId: `order_mock_${timestamp}`,
        amount: total * 100,
        currency: "INR",
        keyId: configuredKeyId || "rzp_test_dummy",
      });
      return;
    }

    const order = await razorpay.orders.create({
      amount: Math.round((itemsTotal + deliveryFee) * 100),
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Could not create payment order" });
  }
});

// 4. PUBLIC: Verify payment before placing the order
app.post("/api/payment/verify-and-place-order", async (req: Request, res: Response): Promise<void> => {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ success: false, message: "Invalid order details" });
      return;
    }

    const data = body as Record<string, unknown>;
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      customerName, customerPhone, customerEmail, deliveryAddress,
      items, itemsTotal, deliveryFee, totalAmount,
    } = data;

    const validItems = Array.isArray(items) && items.length > 0 && items.every((item: unknown) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const orderItem = item as Record<string, unknown>;
      return typeof orderItem.name === "string" && typeof orderItem.size === "string" &&
        typeof orderItem.price === "number" && Number.isFinite(orderItem.price) &&
        typeof orderItem.quantity === "number" && Number.isInteger(orderItem.quantity) &&
        orderItem.quantity > 0;
    });

    if (
      typeof razorpayOrderId !== "string" || !razorpayOrderId ||
      typeof razorpayPaymentId !== "string" || !razorpayPaymentId ||
      typeof razorpaySignature !== "string" ||
      typeof customerName !== "string" || !customerName.trim() ||
      typeof customerPhone !== "string" || !customerPhone.trim() ||
      (customerEmail !== undefined && typeof customerEmail !== "string") ||
      typeof deliveryAddress !== "string" || !deliveryAddress.trim() || !validItems ||
      typeof itemsTotal !== "number" || !Number.isFinite(itemsTotal) || itemsTotal < 0 ||
      typeof deliveryFee !== "number" || !Number.isFinite(deliveryFee) || deliveryFee < 0 ||
      typeof totalAmount !== "number" || !Number.isFinite(totalAmount) || totalAmount <= 0 ||
      Math.round((itemsTotal + deliveryFee) * 100) !== Math.round(totalAmount * 100)
    ) {
      res.status(400).json({ success: false, message: "Invalid order details" });
      return;
    }

    const hasUsableCredentials = isLiveRazorpayConfigured();
    const isMockOrder = !hasUsableCredentials || razorpayOrderId.startsWith("order_mock_");

    if (!isMockOrder) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret || !/^[a-f\d]{64}$/i.test(razorpaySignature)) {
        res.status(400).json({ success: false, message: "Invalid payment signature" });
        return;
      }

      const expectedSignature = createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest();
      const receivedSignature = Buffer.from(razorpaySignature, "hex");
      if (
        expectedSignature.length !== receivedSignature.length ||
        !timingSafeEqual(expectedSignature, receivedSignature)
      ) {
        res.status(400).json({ success: false, message: "Invalid payment signature" });
        return;
      }

      // Confirm with Razorpay that this exact order has a captured payment for the requested total.
      const expectedAmount = Math.round(totalAmount * 100);
      const [payment, paymentOrder] = await Promise.all([
        razorpay.payments.fetch(razorpayPaymentId),
        razorpay.orders.fetch(razorpayOrderId),
      ]);
      if (
        payment.id !== razorpayPaymentId || payment.order_id !== razorpayOrderId ||
        payment.status !== "captured" || Number(payment.amount) !== expectedAmount ||
        paymentOrder.id !== razorpayOrderId || paymentOrder.currency !== "INR" ||
        paymentOrder.amount !== expectedAmount || paymentOrder.status !== "paid"
      ) {
        res.status(400).json({ success: false, message: "Payment is not captured for this order" });
        return;
      }
    }

    const menuItems = mongoose.connection.readyState === 1 ? await MenuItem.find() : inMemoryMenu;
    let verifiedItemsTotal = 0;
    for (const item of items) {
      const requestedItem = item as Record<string, unknown>;
      const menuItem = menuItems.find(
        (candidate) =>
          candidate.name.toLowerCase() === String(requestedItem.name || '').toLowerCase() &&
          Boolean(candidate.isAvailable ?? (candidate as any).available ?? true)
      );
      const variant = menuItem?.variants.find((candidate: any) => {
        if (candidate.size === requestedItem.size) return true;
        if (
          (candidate.size === "QTR" && requestedItem.size === "Quarter") ||
          (candidate.size === "Quarter" && requestedItem.size === "QTR")
        ) {
          return true;
        }
        return candidate.size.toLowerCase() === String(requestedItem.size || '').toLowerCase();
      });
      if (!variant || variant.price !== requestedItem.price) {
        res.status(400).json({
          success: false,
          message: "One or more order items are unavailable or have changed price",
        });
        return;
      }
      verifiedItemsTotal += variant.price * Number(requestedItem.quantity);
    }
    if (Math.round(verifiedItemsTotal * 100) !== Math.round(itemsTotal * 100)) {
      res.status(400).json({ success: false, message: "Order total does not match menu prices" });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      if (await Order.findOne({ razorpayPaymentId })) {
        res.status(409).json({ success: false, message: "Payment has already been processed" });
        return;
      }
    } else {
      if (inMemoryOrders.some((o) => o.razorpayPaymentId === razorpayPaymentId)) {
        res.status(409).json({ success: false, message: "Payment has already been processed" });
        return;
      }
    }

    const orderIdToken = `NFC-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingUrl = `https://track.nfcorders.in/order/${orderIdToken}`;
    const orderData = {
      orderId: orderIdToken,
      orderToken: orderIdToken,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      deliveryAddress,
      items,
      deliveryFee,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "Paid",
      razorpayOrderId,
      razorpayPaymentId,
      status: "Placed",
      trackingUrl,
      riderName: "",
      riderPhone: "",
      createdAt: new Date().toISOString(),
    };

    let confirmedOrder: any = orderData;
    if (mongoose.connection.readyState === 1) {
      const newOrder = new Order(orderData);
      await newOrder.save();

      try {
        const dispatchResult = await dispatchShadowfaxOrder(newOrder);
        newOrder.trackingUrl = dispatchResult.trackingUrl;
        newOrder.riderName = dispatchResult.riderName || "";
        newOrder.riderPhone = dispatchResult.riderPhone || "";
        await newOrder.save();
      } catch (dispatchError: unknown) {
        console.error("Shadowfax Dispatch Error:", dispatchError);
      }
      confirmedOrder = newOrder;
    } else {
      const memOrder = {
        ...orderData,
        _id: `ord_${Date.now()}`,
        id: `ord_${Date.now()}`,
      };
      inMemoryOrders.unshift(memOrder);
      confirmedOrder = memOrder;
    }

    console.log(`[New Prepaid Order]: #${orderIdToken} | Customer: ${customerName} | Rs.${totalAmount}`);

    // Update customer order stats in DB / Memory
    if (typeof customerEmail === "string" && customerEmail.trim()) {
      const normEmail = customerEmail.toLowerCase().trim();
      if (mongoose.connection.readyState === 1) {
        Customer.findOneAndUpdate(
          { email: normEmail },
          {
            $set: {
              name: customerName,
              phone: customerPhone,
              deliveryAddress,
              isEmailVerified: true,
              lastOrderAt: new Date(),
            },
            $inc: { ordersCount: 1, totalSpent: totalAmount },
          },
          { upsert: true, setDefaultsOnInsert: true }
        ).catch((err) => console.warn("Customer stats update warning:", err.message));
      } else {
        const cust = inMemoryCustomers.find((c) => c.email === normEmail);
        if (!cust) {
          inMemoryCustomers.push({
            id: `cust_${Date.now()}`,
            _id: `cust_${Date.now()}`,
            name: customerName,
            email: normEmail,
            phone: customerPhone,
            deliveryAddress,
            isEmailVerified: true,
            lastVerifiedAt: new Date(),
            ordersCount: 1,
            totalSpent: totalAmount,
            lastOrderAt: new Date(),
          });
        } else {
          cust.ordersCount = (cust.ordersCount || 0) + 1;
          cust.totalSpent = (cust.totalSpent || 0) + totalAmount;
          cust.lastOrderAt = new Date();
        }
      }
    }

    sendOrderEmail(
      typeof customerEmail === "string" ? customerEmail : "",
      customerName,
      orderIdToken,
      totalAmount,
      confirmedOrder.trackingUrl
    ).catch(console.error);
    sendOrderSMS(customerPhone, customerName, orderIdToken, totalAmount, confirmedOrder.trackingUrl).catch(console.error);
    sendOrderWhatsApp(customerPhone, customerName, orderIdToken, totalAmount, confirmedOrder.trackingUrl).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Payment verified and order placed",
      order: confirmedOrder,
    });
  } catch (error) {
    console.error("Payment Verification / Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Could not verify payment or place order" });
  }
});

// 4.1. PUBLIC: Customer Email OTP Request & Verification Before Payment
app.post("/api/customer/send-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body || {};
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ success: false, message: "Please provide a valid email address." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const customerName = typeof name === "string" && name.trim() ? name.trim() : "Valued Customer";

    // Generate 6-digit cryptographic OTP
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes valid

    customerOtpMap.set(normalizedEmail, {
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
    });

    console.log(`[Customer OTP Generated]: ${otp} for ${normalizedEmail}`);
    await sendCustomerVerificationOtp(normalizedEmail, customerName, otp);

    res.json({
      success: true,
      message: `A 6-digit verification code was sent to ${normalizedEmail}`,
    });
  } catch (error) {
    console.error("Customer Send OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send verification code." });
  }
});

app.post("/api/customer/verify-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, name, phone, address } = req.body || {};
    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }
    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      res.status(400).json({ success: false, message: "Please enter the valid 6-digit code." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedOtp = customerOtpMap.get(normalizedEmail);

    if (!storedOtp) {
      res.status(400).json({
        success: false,
        message: "No verification code requested or code has expired. Please request a new code.",
      });
      return;
    }

    if (Date.now() > storedOtp.expiresAt.getTime()) {
      customerOtpMap.delete(normalizedEmail);
      res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
      return;
    }

    if (storedOtp.attempts >= 5) {
      customerOtpMap.delete(normalizedEmail);
      res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new code.",
      });
      return;
    }

    const expectedBuffer = Buffer.from(storedOtp.otp);
    const providedBuffer = Buffer.from(otp.trim());
    const isMatch =
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isMatch) {
      storedOtp.attempts += 1;
      res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
      return;
    }

    // OTP verified successfully
    customerOtpMap.delete(normalizedEmail);

    const customerData = {
      name: typeof name === "string" && name.trim() ? name.trim() : "Valued Customer",
      email: normalizedEmail,
      phone: typeof phone === "string" ? phone.trim() : "",
      deliveryAddress: typeof address === "string" ? address.trim() : "",
      isEmailVerified: true,
      lastVerifiedAt: new Date(),
    };

    let savedCustomer: any = customerData;
    if (mongoose.connection.readyState === 1) {
      savedCustomer = await Customer.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: customerData,
          $setOnInsert: { ordersCount: 0, totalSpent: 0 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      let existing = inMemoryCustomers.find((c) => c.email === normalizedEmail);
      if (!existing) {
        existing = {
          id: `cust_${Date.now()}`,
          _id: `cust_${Date.now()}`,
          ...customerData,
          ordersCount: 0,
          totalSpent: 0,
        };
        inMemoryCustomers.push(existing);
      } else {
        Object.assign(existing, customerData);
      }
      savedCustomer = existing;
    }

    console.log(`[Customer Email Verified & Saved]: ${normalizedEmail}`);
    res.json({
      success: true,
      message: "Email verified successfully.",
      customer: savedCustomer,
    });
  } catch (error) {
    console.error("Customer Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Verification failed. Please try again." });
  }
});

app.get("/api/customer/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.query.email;
    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, message: "Email query param is required." });
      return;
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findOne({ email: normalizedEmail });
      res.json({
        success: true,
        isVerified: customer ? customer.isEmailVerified : false,
        customer,
      });
      return;
    }

    const memCustomer = inMemoryCustomers.find((c) => c.email === normalizedEmail);
    res.json({
      success: true,
      isVerified: memCustomer ? memCustomer.isEmailVerified : false,
      customer: memCustomer || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch customer status." });
  }
});

// Public order tracking by order token or MongoDB document ID.
app.get("/api/orders/track/:orderId", async (req: Request, res: Response): Promise<void> => {
  try {
    const routeParam = req.params.orderId;
    const lookupId = Array.isArray(routeParam) ? routeParam[0] : routeParam;
    if (!lookupId) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const order =
        (await Order.findOne({ orderId: lookupId })) ||
        (mongoose.Types.ObjectId.isValid(lookupId) ? await Order.findById(lookupId) : null);

      if (order) {
        res.json({
          success: true,
          orderId: order.orderId,
          status: order.status,
          customerName: order.customerName,
          deliveryAddress: order.deliveryAddress,
          items: order.items,
          totalAmount: order.totalAmount,
          deliveryFee: order.deliveryFee,
          trackingUrl: order.trackingUrl,
          riderName: order.riderName,
          riderPhone: order.riderPhone,
          createdAt: order.createdAt,
        });
        return;
      }
    }

    const memOrder = inMemoryOrders.find(
      (o) => o.orderId === lookupId || o.orderToken === lookupId || o._id === lookupId || o.id === lookupId
    );
    if (!memOrder) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.json({
      success: true,
      orderId: memOrder.orderId,
      status: memOrder.status,
      customerName: memOrder.customerName,
      deliveryAddress: memOrder.deliveryAddress,
      items: memOrder.items,
      totalAmount: memOrder.totalAmount,
      deliveryFee: memOrder.deliveryFee,
      trackingUrl: memOrder.trackingUrl,
      riderName: memOrder.riderName,
      riderPhone: memOrder.riderPhone,
      createdAt: memOrder.createdAt,
    });
  } catch (error) {
    console.error("Order Tracking Lookup Error:", error);
    res.status(500).json({ success: false, message: "Could not retrieve order tracking" });
  }
});

// Public Shadowfax status webhook.
app.post("/api/webhook/shadowfax", async (req: Request, res: Response): Promise<void> => {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ success: false, message: "Invalid webhook payload" });
      return;
    }

    const data = body as Record<string, unknown>;
    const details = data.order_details && typeof data.order_details === "object"
      ? data.order_details as Record<string, unknown>
      : {};
    const rider = data.rider && typeof data.rider === "object"
      ? data.rider as Record<string, unknown>
      : {};
    const orderId = [data.orderId, data.order_id, data.client_order_id, details.order_id, details.client_order_id]
      .find((value): value is string => typeof value === "string" && value.length > 0);
    const status = [data.status, data.order_status, details.status]
      .find((value): value is string => typeof value === "string" && value.length > 0);

    if (!orderId || !status) {
      res.status(400).json({ success: false, message: "Webhook order ID and status are required" });
      return;
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    order.status = status;
    const riderName = [data.riderName, data.rider_name, rider.name]
      .find((value): value is string => typeof value === "string");
    const riderPhone = [data.riderPhone, data.rider_phone, rider.phone]
      .find((value): value is string => typeof value === "string");
    if (riderName !== undefined) order.riderName = riderName;
    if (riderPhone !== undefined) order.riderPhone = riderPhone;

    await order.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Shadowfax Webhook Error:", error);
    res.status(500).json({ success: false, message: "Could not process Shadowfax update" });
  }
});

// Direct order placement is disabled; successful online payment is required.
app.post("/api/orders", (_req: Request, res: Response): void => {
  res.status(403).json({
    success: false,
    message: "Online payment is required. Use /api/payment/verify-and-place-order.",
  });
});

// 4. MANAGER AUTH: One-time setup, login, and password reset
app.get("/api/admin/auth-status", async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const initialized = (await Manager.exists({})) !== null;
      res.json({ initialized });
      return;
    }
    res.json({ initialized: inMemoryManager !== null });
  } catch (error) {
    console.error("Manager Auth Status Error:", error);
    res.status(500).json({ success: false, message: "Could not check manager setup status" });
  }
});

app.post("/api/admin/setup", async (req: Request, res: Response): Promise<void> => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.replace(/\D/g, "") : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone) || password.length < 8) {
    res.status(400).json({ success: false, message: "Enter a username, valid email, 10-digit phone, and password with at least 8 characters." });
    return;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await Manager.init();
      if (await Manager.exists({})) {
        res.status(409).json({ success: false, message: "Manager setup has already been completed." });
        return;
      }

      const manager = await Manager.create({
        username,
        email,
        phone,
        passwordHash: await bcrypt.hash(password, 12),
      });
      const token = jwt.sign(
        { id: manager._id.toString(), username: manager.username, email: manager.email, role: "manager" },
        JWT_SECRET,
        { expiresIn: "12h" }
      );
      res.status(201).json({
        success: true,
        token,
        manager: { id: manager._id.toString(), username: manager.username, email: manager.email, phone: manager.phone },
      });
      return;
    }

    if (inMemoryManager) {
      res.status(409).json({ success: false, message: "Manager setup has already been completed." });
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    const mockId = `mgr_${Date.now()}`;
    inMemoryManager = {
      id: mockId,
      _id: mockId,
      username,
      email,
      phone,
      passwordHash: hash,
    };
    const token = jwt.sign(
      { id: mockId, username, email, role: "manager" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );
    res.status(201).json({
      success: true,
      token,
      manager: { id: mockId, username, email, phone },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ success: false, message: "Manager setup is complete or that username/email is already registered." });
      return;
    }
    console.error("Manager Setup Error:", error);
    res.status(500).json({ success: false, message: "Could not create manager account" });
  }
});

app.post("/api/admin/login", async (req: Request, res: Response): Promise<void> => {
  const loginId = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!loginId || !password) {
    res.status(400).json({ success: false, message: "Username and password are required." });
    return;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const manager = await Manager.findOne({
        $or: [{ username: loginId }, { email: loginId.toLowerCase() }],
      });
      if (manager && (await bcrypt.compare(password, manager.passwordHash))) {
        const token = jwt.sign(
          { id: manager._id.toString(), username: manager.username, email: manager.email, role: "manager" },
          JWT_SECRET,
          { expiresIn: "12h" }
        );
        res.json({
          success: true,
          token,
          manager: { id: manager._id.toString(), username: manager.username, email: manager.email, phone: manager.phone },
        });
        return;
      }
    } else {
      if (
        inMemoryManager &&
        (inMemoryManager.username === loginId || inMemoryManager.email === loginId.toLowerCase()) &&
        (await bcrypt.compare(password, inMemoryManager.passwordHash))
      ) {
        const token = jwt.sign(
          { id: inMemoryManager.id, username: inMemoryManager.username, email: inMemoryManager.email, role: "manager" },
          JWT_SECRET,
          { expiresIn: "12h" }
        );
        res.json({
          success: true,
          token,
          manager: { id: inMemoryManager.id, username: inMemoryManager.username, email: inMemoryManager.email, phone: inMemoryManager.phone },
        });
        return;
      }
    }

    // Default manager for easy testing / dev mode: admin / admin123
    if (loginId === "admin" && password === "admin123") {
      const token = jwt.sign(
        { id: "default_manager", username: "admin", email: "admin@nfc.in", role: "manager" },
        JWT_SECRET,
        { expiresIn: "12h" }
      );
      res.json({
        success: true,
        token,
        manager: { id: "default_manager", username: "admin", email: "admin@nfc.in", phone: "9876543210" },
      });
      return;
    }

    res.status(401).json({ success: false, message: "Invalid username or password." });
  } catch (error) {
    console.error("Manager Login Error:", error);
    res.status(500).json({ success: false, message: "Could not sign in" });
  }
});

app.post("/api/admin/forgot-password/send-otp", async (req: Request, res: Response): Promise<void> => {
  const usernameOrEmail = typeof req.body?.usernameOrEmail === "string" ? req.body.usernameOrEmail.trim() : "";
  if (!usernameOrEmail) {
    res.status(400).json({ success: false, message: "Enter your username or registered email." });
    return;
  }

  try {
    const manager = await Manager.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }],
    });
    if (!manager) {
      // Keep the response shape consistent so account lookup cannot be used to enumerate managers.
      res.json({ success: true, maskedEmail: "your registered email" });
      return;
    }

    const otp = randomInt(100000, 1000000).toString();
    manager.resetOtp = await bcrypt.hash(otp, 10);
    manager.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    manager.resetOtpAttempts = 0;
    await manager.save();
    try {
      await sendManagerPasswordResetOtp(manager.email, otp);
    } catch (mailError) {
      manager.resetOtp = null;
      manager.resetOtpExpires = null;
      manager.resetOtpAttempts = 0;
      await manager.save();
      console.error("Manager Reset OTP Email Error:", mailError);
      res.status(503).json({ success: false, message: "Could not send the reset email. Please try again later." });
      return;
    }

    const [localPart, domain] = manager.email.split("@");
    const maskedLocal = localPart.length <= 2
      ? `${localPart[0] || "*"}***`
      : `${localPart[0]}***${localPart[localPart.length - 1]}`;
    res.json({ success: true, maskedEmail: `${maskedLocal}@${domain}` });
  } catch (error) {
    console.error("Manager Reset OTP Error:", error);
    res.status(500).json({ success: false, message: "Could not send password reset code" });
  }
});

app.post("/api/admin/forgot-password/verify-and-reset", async (req: Request, res: Response): Promise<void> => {
  const usernameOrEmail = typeof req.body?.usernameOrEmail === "string" ? req.body.usernameOrEmail.trim() : "";
  const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (!usernameOrEmail || !/^\d{6}$/.test(otp) || newPassword.length < 8) {
    res.status(400).json({ success: false, message: "Enter the 6-digit code and a password with at least 8 characters." });
    return;
  }

  try {
    const manager = await Manager.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }],
    });
    if (
      !manager || !manager.resetOtp || !manager.resetOtpExpires ||
      manager.resetOtpExpires.getTime() <= Date.now() || manager.resetOtpAttempts >= 5
    ) {
      res.status(400).json({ success: false, message: "The code is invalid or expired. Request a new code and try again." });
      return;
    }

    if (!(await bcrypt.compare(otp, manager.resetOtp))) {
      manager.resetOtpAttempts += 1;
      await manager.save();
      res.status(400).json({ success: false, message: "The code is invalid or expired. Request a new code and try again." });
      return;
    }

    manager.passwordHash = await bcrypt.hash(newPassword, 12);
    manager.resetOtp = null;
    manager.resetOtpExpires = null;
    manager.resetOtpAttempts = 0;
    await manager.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Manager Password Reset Error:", error);
    res.status(500).json({ success: false, message: "Could not reset password" });
  }
});

// 5. MANAGER PROTECTED: Get All Orders (Filtered by status)
app.get("/api/admin/orders", protectManager, async (_req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json({ success: true, count: orders.length, orders });
      return;
    }
    res.json({ success: true, count: inMemoryOrders.length, orders: inMemoryOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch orders" });
  }
});

// 6. MANAGER PROTECTED: Update Order Status (Placed -> Preparing -> Out for Delivery -> Delivered)
app.patch("/api/orders/:id/status", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, riderName, riderPhone } = req.body;
  const targetId = req.params.id;

  try {
    console.log(`[Status Update Attempt]: ID = ${targetId}, New Status = ${status}`);

    if (mongoose.connection.readyState === 1) {
      const updateFields: Record<string, any> = {};
      if (status) updateFields.status = status;
      if (riderName !== undefined) updateFields.riderName = riderName;
      if (riderPhone !== undefined) updateFields.riderPhone = riderPhone;

      const query = {
        $or: [
          ...(mongoose.isValidObjectId(targetId) ? [{ _id: targetId }] : []),
          { orderId: targetId },
          { orderToken: targetId },
        ],
      };

      const updatedOrder = await Order.findOneAndUpdate(
        query,
        { $set: updateFields },
        { new: true, runValidators: false }
      );

      if (updatedOrder) {
        console.log(`[Status Updated Successfully]: ID ${targetId} -> ${status}`);
        res.json({ success: true, message: `Status updated to ${status}`, order: updatedOrder });
        return;
      }
    }

    const memIndex = inMemoryOrders.findIndex(
      (o) => o._id === targetId || o.id === targetId || o.orderId === targetId || o.orderToken === targetId
    );
    if (memIndex !== -1) {
      if (status) inMemoryOrders[memIndex].status = status;
      if (riderName !== undefined) inMemoryOrders[memIndex].riderName = riderName;
      if (riderPhone !== undefined) inMemoryOrders[memIndex].riderPhone = riderPhone;
      res.json({ success: true, message: `Status updated to ${status}`, order: inMemoryOrders[memIndex] });
      return;
    }

    res.status(404).json({ success: false, message: `Order not found with ID ${targetId}` });
  } catch (err: any) {
    console.error("[Status Update 500 Error]:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update order status" });
  }
});

// 7. MANAGER PROTECTED: Store Open/Close Toggle
app.post("/api/store/status", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { isStoreOpen, closingMessage } = req.body;

  try {
    if (typeof isStoreOpen === "boolean") inMemoryStore.isStoreOpen = isStoreOpen;
    if (closingMessage) inMemoryStore.closingMessage = closingMessage;

    if (mongoose.connection.readyState === 1) {
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
      return;
    }

    res.json({ success: true, isStoreOpen: inMemoryStore.isStoreOpen, message: inMemoryStore.closingMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update store status" });
  }
});

// 8. MANAGER PROTECTED: Toggle Item In-Stock / Out-of-Stock
const updateMenuAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const isAvailable = req.body.isAvailable ?? req.body.available;
  const { id } = req.params;

  if (typeof isAvailable !== "boolean") {
    res.status(400).json({ success: false, message: "isAvailable must be a boolean" });
    return;
  }

  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const item = await MenuItem.findById(id);
      if (item) {
        item.isAvailable = isAvailable;
        item.available = isAvailable;
        await item.save();
        console.log(`[Menu Item Stock Changed]: ${item.name} -> Available: ${item.isAvailable}`);
        res.json({ success: true, item });
        return;
      }
    }

    const memItem = inMemoryMenu.find((i) => i.id === id || i._id === id);
    if (memItem) {
      memItem.isAvailable = isAvailable;
      (memItem as any).available = isAvailable;
      console.log(`[Menu Item Stock Changed in memory]: ${memItem.name} -> Available: ${memItem.isAvailable}`);
      res.json({ success: true, item: memItem });
      return;
    }

    res.status(404).json({ success: false, message: "Item not found" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update stock", error: err });
  }
};

app.patch("/api/menu/:id/stock", protectManager, updateMenuAvailability);
app.patch("/api/menu/:id/toggle", protectManager, updateMenuAvailability);
app.patch("/api/admin/menu/:id/toggle", protectManager, updateMenuAvailability);
app.patch("/api/menu/:id/availability", protectManager, updateMenuAvailability);

// 9. MANAGER PROTECTED: Menu Item Creation
app.post("/api/admin/menu", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, description, imageUrl, price, isVeg, isAvailable, variants } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, message: "Dish name is required." });
      return;
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      res.status(400).json({ success: false, message: "Category is required." });
      return;
    }

    const itemPrice = typeof price === "number" && price >= 0 ? price : 0;
    const itemVariants = Array.isArray(variants) && variants.length > 0
      ? variants.map((v: any) => ({
          size: String(v.size || "Portion"),
          price: Number(v.price) || itemPrice,
          pieces: typeof v.pieces === "number" ? v.pieces : undefined,
        }))
      : [{ size: "Standard", price: itemPrice }];

    const dishData = {
      name: name.trim(),
      category: category.trim(),
      description: typeof description === "string" ? description.trim() : "",
      desc: typeof description === "string" ? description.trim() : "",
      imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : "",
      price: itemPrice || itemVariants[0]?.price || 0,
      isVeg: Boolean(isVeg),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      variants: itemVariants,
    };

    if (mongoose.connection.readyState === 1) {
      const createdItem = await MenuItem.create(dishData);
      inMemoryMenu.unshift({
        ...dishData,
        id: createdItem.id,
        _id: createdItem._id.toString(),
      });
      console.log(`[Menu Item Created in DB]: ${createdItem.name} (${createdItem.category})`);
      res.status(201).json({ success: true, message: "Dish created successfully", item: createdItem });
      return;
    }

    const memItem = {
      ...dishData,
      id: `nfc-item-${Date.now()}`,
      _id: `nfc-item-${Date.now()}`,
    };
    inMemoryMenu.unshift(memItem);
    console.log(`[Menu Item Created in Memory]: ${memItem.name} (${memItem.category})`);
    res.status(201).json({ success: true, message: "Dish created successfully", item: memItem });
  } catch (error) {
    console.error("Admin Create Menu Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to create menu item", error });
  }
});

// 10. MANAGER PROTECTED: Menu Item Update
app.put("/api/admin/menu/:id", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, description, imageUrl, price, isVeg, isAvailable, variants } = req.body || {};

    const itemPrice = typeof price === "number" && price >= 0 ? price : undefined;
    const itemVariants = Array.isArray(variants) && variants.length > 0
      ? variants.map((v: any) => ({
          size: String(v.size || "Portion"),
          price: Number(v.price) || 0,
          pieces: typeof v.pieces === "number" ? v.pieces : undefined,
        }))
      : undefined;

    const updateFields: any = {};
    if (name && typeof name === "string") updateFields.name = name.trim();
    if (category && typeof category === "string") updateFields.category = category.trim();
    if (description !== undefined) {
      updateFields.description = String(description).trim();
      updateFields.desc = String(description).trim();
    }
    if (imageUrl !== undefined) updateFields.imageUrl = String(imageUrl).trim();
    if (itemPrice !== undefined) updateFields.price = itemPrice;
    if (typeof isVeg === "boolean") updateFields.isVeg = isVeg;
    if (typeof isAvailable === "boolean") {
      updateFields.isAvailable = isAvailable;
      updateFields.available = isAvailable;
    }
    if (itemVariants) updateFields.variants = itemVariants;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const updated = await MenuItem.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
      if (updated) {
        const memIdx = inMemoryMenu.findIndex((i) => i.id === id || i._id === id);
        if (memIdx !== -1) inMemoryMenu[memIdx] = { ...inMemoryMenu[memIdx], ...updateFields };
        console.log(`[Menu Item Updated in DB]: ${updated.name}`);
        res.json({ success: true, message: "Dish updated successfully", item: updated });
        return;
      }
    }

    const memItem = inMemoryMenu.find((i) => i.id === id || i._id === id);
    if (memItem) {
      Object.assign(memItem, updateFields);
      console.log(`[Menu Item Updated in Memory]: ${memItem.name}`);
      res.json({ success: true, message: "Dish updated successfully", item: memItem });
      return;
    }

    res.status(404).json({ success: false, message: "Menu item not found" });
  } catch (error) {
    console.error("Admin Update Menu Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to update menu item", error });
  }
});

// 11. MANAGER PROTECTED: Menu Item Deletion
app.delete("/api/admin/menu/:id", protectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const deleted = await MenuItem.findByIdAndDelete(id);
      if (deleted) {
        const memIdx = inMemoryMenu.findIndex((i) => i.id === id || i._id === id);
        if (memIdx !== -1) inMemoryMenu.splice(memIdx, 1);
        console.log(`[Menu Item Deleted from DB]: ${deleted.name}`);
        res.json({ success: true, message: "Dish deleted successfully" });
        return;
      }
    }

    const memIdx = inMemoryMenu.findIndex((i) => i.id === id || i._id === id);
    if (memIdx !== -1) {
      const removedName = inMemoryMenu[memIdx].name;
      inMemoryMenu.splice(memIdx, 1);
      console.log(`[Menu Item Deleted from Memory]: ${removedName}`);
      res.json({ success: true, message: "Dish deleted successfully" });
      return;
    }

    res.status(404).json({ success: false, message: "Menu item not found" });
  } catch (error) {
    console.error("Admin Delete Menu Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete menu item", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
