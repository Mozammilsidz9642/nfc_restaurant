import { createContext } from 'react';
import type { CartItem, DiningMode, BillSummaryData } from '../types/cart';
import type { MenuItem, PriceVariant, MenuAddon } from '../types/menu';

export interface CartContextType {
  cart: CartItem[];
  addToCart: (
    item: MenuItem,
    variant: PriceVariant,
    quantity?: number,
    addons?: MenuAddon[],
    instruction?: string
  ) => void;
  updateQty: (uniqueKey: string, delta: number) => void;
  removeFromCart: (uniqueKey: string) => void;
  clearCart: () => void;
  totalCount: number;
  itemsTotal: number;
  billSummary: BillSummaryData;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  diningMode: DiningMode;
  setDiningMode: (mode: DiningMode) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  toast: { message: string; visible: boolean } | null;
  hideToast: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

