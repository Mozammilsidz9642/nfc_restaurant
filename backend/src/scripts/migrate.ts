import mongoose from "mongoose";
import dotenv from "dotenv";
import { migrateMenu } from "./migrate-menu";
import { migrateCustomers } from "./migrate-customers";

dotenv.config();

async function runAllMigrations(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment");
  }

  console.log("==========================================");
  console.log("🚀 Starting NFC Database Migrations...");
  console.log("==========================================");

  try {
    console.log("\n--- [1/2] Migrating Menu Items ---");
    await migrateMenu();

    console.log("\n--- [2/2] Migrating Customers ---");
    await migrateCustomers();

    console.log("\n==========================================");
    console.log("🎉 All migrations completed successfully!");
    console.log("==========================================");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("\n❌ Migration failed:", errorMsg);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

runAllMigrations();

