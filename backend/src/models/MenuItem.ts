import { Schema, model, Document } from "mongoose";

export interface IPriceVariant {
  size: string;
  price: number;
  pieces?: number;
}

export interface IMenuItem {
  id?: string;
  name: string;
  category: string;
  description?: string;
  desc?: string;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  variants: IPriceVariant[];
}

export interface MenuItemDocument extends IMenuItem, Document {}

const MenuItemSchema = new Schema<MenuItemDocument>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    desc: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        pieces: { type: Number }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.description && ret.desc) {
          ret.description = ret.desc;
        }
        if (!ret.desc && ret.description) {
          ret.desc = ret.description;
        }
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

MenuItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export default model<MenuItemDocument>("MenuItem", MenuItemSchema);
