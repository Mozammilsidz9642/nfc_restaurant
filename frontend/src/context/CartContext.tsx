import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, DiningMode, BillSummaryData } from '../types/cart';
import type { MenuItem, PriceVariant, MenuAddon } from '../types/menu';
import { CartContext } from './CartContextDef';

const CART_STORAGE_KEY = 'nfc_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [diningMode, setDiningMode] = useState<DiningMode>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) {
        return `Table ${tableParam.padStart(2, '0')}`;
      }
    }
    return 'Table 04';
  });
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage unavailable or full
    }
  }, [cart]);

  const hideToast = () => {
    setToast((prev) => (prev ? { ...prev, visible: false } : null));
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      hideToast();
    }, 2800);
  };

  const addToCart = (
    item: MenuItem,
    variant: PriceVariant,
    quantity = 1,
    addons: MenuAddon[] = [],
    instruction = ''
  ) => {
    const addonIds = addons.map((a) => a.id).sort().join('-');
    const uniqueKey = `${item.id || item._id}-${variant.size}-${addonIds}-${instruction.trim()}`;
    const addonsCost = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = variant.price + addonsCost;

    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.uniqueKey === uniqueKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        uniqueKey,
        itemId: item.id || item._id || '',
        name: item.name,
        size: variant.size,
        price: unitPrice,
        quantity,
        pieces: variant.pieces,
        isVeg: item.isVeg,
        image: item.imageUrl || item.image,
        addons: addons.length > 0 ? addons : undefined,
        instruction: instruction.trim() || undefined,
      };
      return [...prev, newItem];
    });

    showToast(`Added ${quantity}× ${item.name} (${variant.size})`);
  };

  const updateQty = (uniqueKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.uniqueKey === uniqueKey) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (uniqueKey: string) => {
    setCart((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Standard Indian Restaurant Tax & Packaging computation
  const gst = Math.round(itemsTotal * 0.05); // 5% GST on Restaurant Services
  const packagingCharge = diningMode === 'takeaway' && itemsTotal > 0 ? 25 : 0;
  const discount = 0;
  const grandTotal = itemsTotal + gst + packagingCharge - discount;

  const billSummary: BillSummaryData = {
    itemTotal: itemsTotal,
    gst,
    packagingCharge,
    discount,
    grandTotal,
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalCount,
        itemsTotal,
        billSummary,
        isCartOpen,
        setIsCartOpen,
        diningMode,
        setDiningMode,
        tableNumber,
        setTableNumber,
        toast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

