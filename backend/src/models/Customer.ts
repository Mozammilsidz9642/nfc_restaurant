import { Document, model, Schema } from "mongoose";

export interface ICustomer {
  name: string;
  email: string;
  phone: string;
  deliveryAddress?: string;
  isEmailVerified: boolean;
  lastVerifiedAt?: Date;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerDocument extends ICustomer, Document {}

const CustomerSchema = new Schema<CustomerDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true, index: true },
    deliveryAddress: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    lastVerifiedAt: { type: Date },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id ? (ret._id as object).toString() : ret.id;
        return ret;
      },
    },
  }
);

CustomerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export default model<CustomerDocument>("Customer", CustomerSchema);

