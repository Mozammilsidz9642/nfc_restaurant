import type { MenuAddon } from './menu';

export interface CartItem {
  uniqueKey: string;
  itemId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  pieces?: number;
  isVeg?: boolean;
  image?: string;
  addons?: MenuAddon[];
  instruction?: string;
}

export type DiningMode = 'dine-in' | 'takeaway' | 'delivery';

export interface BillSummaryData {
  itemTotal: number;
  gst: number;
  packagingCharge: number;
  discount: number;
  grandTotal: number;
}

