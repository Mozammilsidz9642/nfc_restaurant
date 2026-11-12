import mongoose, { Document, Schema } from "mongoose";

export interface IRestaurantTable extends Document {
  tableNumber: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
}

const RestaurantTableSchema = new Schema<IRestaurantTable>({
  tableNumber: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  capacity: { type: Number, default: 4 },
  isAvailable: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const RestaurantTable = mongoose.model<IRestaurantTable>(
  "RestaurantTable",
  RestaurantTableSchema
);
export default RestaurantTable;
