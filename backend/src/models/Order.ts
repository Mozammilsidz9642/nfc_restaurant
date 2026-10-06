import { Document, model, Schema } from "mongoose";

export interface IOrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface OrderDocument extends Document {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: IOrderItem[];
  totalAmount: number;
  status: string;
  trackingUrl: string;
  riderName: string;
  riderPhone: string;
  createdAt: Date;
}

const OrderSchema = new Schema<OrderDocument>({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: "" },
  deliveryAddress: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      size: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Placed" },
  trackingUrl: { type: String, default: "" },
  riderName: { type: String, default: "" },
  riderPhone: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default model<OrderDocument>("Order", OrderSchema);