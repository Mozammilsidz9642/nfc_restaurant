import { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Clock, Flame, Star } from 'lucide-react';
import type { MenuItem, PriceVariant, MenuAddon } from '../../types/menu';
import { VegBadge } from '../common/VegBadge';
import { Badge } from '../common/Badge';
import { useCart } from '../../context/useCart';

interface ProductDetailSheetProps {
  item: MenuItem | null;
  onClose: () => void;
}

function ProductDetailModalContent({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<PriceVariant>(
    item.variants[0] || { size: 'Regular', price: 0 }
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [cookingInstruction, setCookingInstruction] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = selectedVariant.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: MenuAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    addToCart(item, selectedVariant, quantity, selectedAddons, cookingInstruction);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/80 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-luxury border border-stone-200/90 overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-slideUp text-stone-900"
      >
        {/* Mobile Pull Drag Handle */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-stone-900">
          <div className="w-10 h-1 bg-stone-700 rounded-full" />
        </div>

        {/* Header Media Container */}
        <div className="relative w-full aspect-16/9 sm:aspect-16/10 bg-stone-950 shrink-0">
          <img
            src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
            alt={item.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30 pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white backdrop-blur-md border border-stone-700/60 shadow-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
            <div className="flex items-center gap-2">
              <VegBadge isVeg={item.isVeg} size="md" />
              {item.badges && item.badges[0] && (
                <Badge label={item.badges[0]} size="sm" />
              )}
            </div>

            {item.rating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-950/90 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.rating}</span>
                {item.reviewCount && (
                  <span className="text-[10px] text-stone-400 font-normal">
                    ({item.reviewCount})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Dish Information */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 tracking-wider uppercase mb-1">
              <span>{item.category}</span>
              {item.prepTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-stone-500 font-medium normal-case">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {item.prepTime}
                  </span>
                </>
              )}
              {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-orange-600 font-semibold normal-case">
                    <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                    <span>Spice {item.spiceLevel}/3</span>
                  </span>
                </>
              )}
            </div>

            <h2 className="font-serif font-black text-xl sm:text-2xl text-stone-900 tracking-tight">
              {item.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1.5">
              {item.description}
            </p>
          </div>

          {/* Portion / Variant Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-serif font-bold text-sm text-stone-900 tracking-wide">
                Choose Portion / Size <span className="text-brand-red-700">*</span>
              </label>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Select 1 option
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {item.variants.map((v) => {
                const isSelected = selectedVariant.size === v.size;
                return (
                  <button
                    key={v.size}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-brand-red-700 bg-brand-red-50/60 ring-2 ring-brand-red-700/20 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-brand-red-700 bg-brand-red-700 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                          {v.size}
                        </span>
                        {v.pieces && (
                          <span className="text-[11px] text-stone-500">
                            {v.pieces} {v.pieces === 1 ? 'piece' : 'pieces'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                      ₹{v.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons Selection */}
          {item.addons && item.addons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="font-serif font-bold text-sm text-stone-900 tracking-wide">
                  Recommended Add-ons & Sides
                </label>
                <span className="text-[11px] text-stone-500">Optional</span>
              </div>

              <div className="space-y-2">
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        isChecked
                          ? 'border-amber-500/80 bg-amber-50/50 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold text-stone-800">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-700">
                        +₹{addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking Instructions / Special Requests */}
          <div>
            <label
              htmlFor="special-instructions"
              className="font-serif font-bold text-sm text-stone-900 tracking-wide block mb-1.5"
            >
              Special Cooking Request
            </label>
            <input
              id="special-instructions"
              type="text"
              value={cookingInstruction}
              onChange={(e) => setCookingInstruction(e.target.value)}
              placeholder="e.g. Less spicy, well done, extra onion salad"
              className="w-full text-xs text-stone-800 placeholder-stone-400 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-brand-red-700 focus:bg-white transition-colors"
            />
          </div>

          {/* Quantity Selector */}
          <div className="pt-2 flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-stone-900">
              Quantity
            </span>
            <div className="inline-flex items-center gap-3 bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white hover:bg-stone-50 text-stone-800 flex items-center justify-center shadow-2xs transition-transform active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-sm sm:text-base text-stone-900 w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-brand-red-700 hover:bg-brand-red-800 text-white flex items-center justify-center shadow-2xs transition-transform active:scale-90 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/80 backdrop-blur-xs flex items-center justify-between gap-3 safe-bottom">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
              Item Total
            </span>
            <span className="font-serif font-black text-xl sm:text-2xl text-stone-900">
              ₹{totalPrice}
            </span>
          </div>

          {item.isAvailable ?? item.available ?? true ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-red-950/30 flex items-center justify-center gap-2 active:scale-97 transition-all cursor-pointer border border-amber-500/30"
            >
              <span>Add to Cart</span>
              <span>•</span>
              <span>₹{totalPrice}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 max-w-xs py-3.5 px-6 rounded-xl bg-stone-300 text-stone-500 font-bold text-xs sm:text-sm tracking-wide cursor-not-allowed flex items-center justify-center gap-2"
            >
              Item Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSheet({ item, onClose }: ProductDetailSheetProps) {
  if (!item) return null;
  return (
    <ProductDetailModalContent
      key={item.id || item._id}
      item={item}
      onClose={onClose}
    />
  );
}

