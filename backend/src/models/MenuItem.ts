import { Schema, model, Document } from "mongoose";

export interface IPriceVariant {
  size: string;
  price: number;
  pieces?: number;
}

export interface IMenuItem {
  name: string;
  category: string;
  desc?: string;
  isVeg: boolean;
  isAvailable: boolean;
  variants: IPriceVariant[];
}

export interface MenuItemDocument extends IMenuItem, Document {}

const MenuItemSchema = new Schema<MenuItemDocument>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  desc: { type: String, default: "" },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  variants: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
      pieces: { type: Number }
    }
  ]
});

export default model<MenuItemDocument>("MenuItem", MenuItemSchema);
