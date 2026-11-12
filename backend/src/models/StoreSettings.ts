import mongoose, { Document, Schema } from "mongoose";

export interface IStoreSettings extends Document {
  isStoreOpen: boolean;
  closingMessage?: string;
  isTableOrderingEnabled: boolean;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>({
  isStoreOpen: { type: Boolean, default: true },
  closingMessage: { type: String, default: "We are currently closed. Will open soon!" },
  isTableOrderingEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

export const StoreSettings = mongoose.model<IStoreSettings>(
  "StoreSettings",
  StoreSettingsSchema
);