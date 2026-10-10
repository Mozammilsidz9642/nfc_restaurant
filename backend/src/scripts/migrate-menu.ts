import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "../models/MenuItem";
import { realNFCMenu } from "../seed";

dotenv.config();

export async function migrateMenu(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment");
  }

  console.log("Connecting to MongoDB for Menu Migration...");
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB.");

  let upsertedCount = 0;
  for (const item of realNFCMenu) {
    await MenuItem.findOneAndUpdate(
      { name: item.name },
      {
        $set: {
          name: item.name,
          category: item.category,
          description: item.description,
          desc: item.desc,
          imageUrl: item.imageUrl,
          price: item.price,
          isVeg: item.isVeg,
          isAvailable: item.isAvailable,
          variants: item.variants,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upsertedCount++;
  }

  const totalInDb = await MenuItem.countDocuments();
  console.log(`✅ Menu migration complete! Processed ${upsertedCount} items. Total in DB: ${totalInDb}`);
}

if (require.main === module) {
  migrateMenu()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Menu migration failed:", err.message);
      process.exit(1);
    });
}

