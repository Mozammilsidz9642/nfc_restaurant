import { model, Schema } from "mongoose";

export interface ManagerDocument {
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  resetOtp: string | null;
  resetOtpExpires: Date | null;
  resetOtpAttempts: number;
  setupKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerSchema = new Schema<ManagerDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
    resetOtpAttempts: { type: Number, default: 0 },
    // A unique fixed key makes the initial setup endpoint single-use even under concurrent requests.
    setupKey: { type: String, required: true, unique: true, default: "primary-manager" },
  },
  { timestamps: true }
);

export const Manager = model<ManagerDocument>("Manager", ManagerSchema);
