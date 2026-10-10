import mongoose from "mongoose";
import dotenv from "dotenv";
import Customer from "../models/Customer";
import Order from "../models/Order";

dotenv.config();

export async function migrateCustomers(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment");
  }

  console.log("Connecting to MongoDB for Customer Migration...");
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB.");

  // 1. Ensure indexes
  await Customer.createIndexes();
  console.log("Customer indexes created/verified.");

  // 2. Backfill existing customers from historical orders if any
  const orders = await Order.find({ customerEmail: { $exists: true, $ne: "" } });
  console.log(`Found ${orders.length} orders to check for customer backfill.`);

  let backfilledCount = 0;
  for (const order of orders) {
    if (!order.customerEmail) continue;
    const email = order.customerEmail.toLowerCase().trim();

    const existing = await Customer.findOne({ email });
    if (!existing) {
      await Customer.create({
        name: order.customerName,
        email,
        phone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        isEmailVerified: true,
        lastVerifiedAt: order.createdAt || new Date(),
        ordersCount: 1,
        totalSpent: order.totalAmount,
        lastOrderAt: order.createdAt || new Date(),
      });
      backfilledCount++;
    } else {
      existing.ordersCount = (existing.ordersCount || 0) + 1;
      existing.totalSpent = (existing.totalSpent || 0) + order.totalAmount;
      if (order.createdAt && (!existing.lastOrderAt || order.createdAt > existing.lastOrderAt)) {
        existing.lastOrderAt = order.createdAt;
      }
      await existing.save();
    }
  }

  const totalCustomers = await Customer.countDocuments();
  console.log(`✅ Customer migration complete! Backfilled: ${backfilledCount}. Total customers in DB: ${totalCustomers}`);
}

if (require.main === module) {
  migrateCustomers()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Customer migration failed:", err.message);
      process.exit(1);
    });
}

