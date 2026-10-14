import { Document, model, Schema } from "mongoose";

export interface IOrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface OrderDocument extends Document {
  orderId: string;
  orderToken?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: IOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: "Paid";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: string;
  trackingUrl: string;
  shadowfaxOrderId: string | null;
  shadowfaxTrackingUrl: string | null;
  riderName: string | null;
  riderPhone: string | null;
  deliveryStatus: string;
  riderLatitude?: number | null;
  riderLongitude?: number | null;
  createdAt: Date;
}

const OrderSchema = new Schema<OrderDocument>({
  orderId: { type: String, unique: true },
  orderToken: { type: String, index: true },
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
  deliveryFee: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "ONLINE" },
  paymentStatus: { type: String, enum: ["Paid"], default: "Paid" },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true, unique: true, sparse: true },
  status: { type: String, default: "Placed" },
  trackingUrl: { type: String, default: "" },
  shadowfaxOrderId: { type: String, default: null },
  shadowfaxTrackingUrl: { type: String, default: null },
  riderName: { type: String, default: null },
  riderPhone: { type: String, default: null },
  deliveryStatus: { type: String, default: "ALLOCATING" },
  riderLatitude: { type: Number, default: null },
  riderLongitude: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default model<OrderDocument>("Order", OrderSchema);
