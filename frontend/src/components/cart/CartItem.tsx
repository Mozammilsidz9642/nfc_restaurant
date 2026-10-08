import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types/cart';
import { VegBadge } from '../common/VegBadge';
import { useCart } from '../../context/useCart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQty, removeFromCart } = useCart();

  const lineTotal = item.price * item.quantity;

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs flex items-start justify-between gap-3 transition-all hover:border-stone-300">
      {/* Left Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {item.isVeg !== undefined && <VegBadge isVeg={item.isVeg} size="sm" />}
          <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
            {item.name}
          </h4>
        </div>

        {/* Portion size */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-semibold">
            {item.size}
          </span>
          {item.pieces && <span>• {item.pieces} pcs</span>}
          <span>• ₹{item.price} each</span>
        </div>

        {/* Addons List */}
        {item.addons && item.addons.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {item.addons.map((a) => (
              <p key={a.id} className="text-[11px] text-amber-900/80 font-medium">
                + {a.name} (₹{a.price})
              </p>
            ))}
          </div>
        )}

        {/* Special Instructions Note */}
        {item.instruction && (
          <p className="mt-1 text-[11px] text-stone-400 italic bg-stone-50 p-1.5 rounded-lg border border-stone-100">
            Note: &ldquo;{item.instruction}&rdquo;
          </p>
        )}
      </div>

      {/* Right Controls: Stepper & Total */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
        <span className="font-serif font-black text-sm text-stone-900">
          ₹{lineTotal}
        </span>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => removeFromCart(item.uniqueKey)}
            className="text-stone-300 hover:text-red-600 p-1 transition-colors"
            title="Remove item"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="inline-flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
            <button
              onClick={() => updateQty(item.uniqueKey, -1)}
              className="w-6 h-6 rounded-lg bg-white text-stone-700 hover:bg-stone-50 flex items-center justify-center shadow-2xs transition-transform active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-stone-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.uniqueKey, 1)}
              className="w-6 h-6 rounded-lg bg-brand-red-700 text-white hover:bg-brand-red-800 flex items-center justify-center shadow-2xs transition-transform active:scale-90"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
