import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";

interface Variant {
  size: string;
  price: number;
  pieces?: number;
}

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  isVeg: boolean;
  variants: Variant[];
}

interface CartItem {
  itemId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = ["All", "Starters", "Main Course", "Biryani", "Breads"];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/menu")
      .then((res) => setMenu(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleVariantChange = (itemId: string, size: string) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: size }));
  };

  const addToCart = (item: MenuItem) => {
    const chosenSize = selectedVariants[item._id] || item.variants[0]?.size;
    const variant = item.variants.find((v) => v.size === chosenSize) || item.variants[0];

    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item._id && c.size === variant.size);
      if (existing) {
        return prev.map((c) =>
          c.itemId === item._id && c.size === variant.size
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          itemId: item._id,
          name: item.name,
          size: variant.size,
          price: variant.price,
          quantity: 1
        }
      ];
    });
  };

  const updateQty = (itemId: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.itemId === itemId && c.size === size) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const filteredItems =
    selectedCategory === "All"
      ? menu
      : menu.filter((m) => m.category === selectedCategory);

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <header className="sticky top-0 z-40 bg-red-700 text-white shadow px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black tracking-wider">NOIDA FRIED CHICKEN</h1>
          <p className="text-xs text-red-100">Authentic North Indian & Mughlai Delicacies</p>
        </div>
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="relative p-2 bg-red-800 rounded-full"
        >
          <ShoppingBag size={22} />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>
      </header>

      <div className="flex overflow-x-auto gap-2 p-3 bg-white border-b">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-red-700 text-white shadow"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-2xl mx-auto space-y-3">
        {filteredItems.map((item) => {
          const currentSize = selectedVariants[item._id] || item.variants[0]?.size;
          const currentVariant =
            item.variants.find((v) => v.size === currentSize) || item.variants[0];

          return (
            <div
              key={item._id}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.isVeg ? "bg-green-600" : "bg-red-600"
                    }`}
                  ></span>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => handleVariantChange(item._id, v.size)}
                      className={`text-xs px-2.5 py-1 rounded border font-medium transition-all ${
                        currentSize === v.size
                          ? "border-red-600 bg-red-50 text-red-700 font-bold"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {v.size} {v.pieces ? `(${v.pieces} pcs)` : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between items-end">
                <span className="font-bold text-lg text-gray-900">
                  ₹{currentVariant?.price}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="mt-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus size={14} /> ADD
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-between items-center max-w-2xl mx-auto z-30">
          <div>
            <p className="text-xs text-gray-500">{totalCount} Items</p>
            <p className="text-lg font-black text-gray-900">₹{totalAmount}</p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide shadow flex items-center gap-2"
          >
            View Order <ShoppingBag size={16} />
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col p-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.map((c) => (
                <div
                  key={`${c.itemId}-${c.size}`}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{c.name}</h4>
                    <p className="text-xs text-gray-500">
                      {c.size} • ₹{c.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(c.itemId, c.size, -1)}
                      className="p-1 bg-white border rounded shadow-sm text-gray-700"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {c.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(c.itemId, c.size, 1)}
                      className="p-1 bg-white border rounded shadow-sm text-gray-700"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
              <button
                onClick={() => alert("Order Placed Successfully!")}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}