import { useState, useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/useCart';
import { CartItem } from './CartItem';
import { BillSummary } from './BillSummary';
import { EmptyState } from '../common/EmptyState';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    billSummary,
    clearCart,
    tableNumber,
    diningMode,
    setDiningMode,
  } = useCart();

  const [isDemoOrderPlaced, setIsDemoOrderPlaced] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    // Trigger festive micro-interaction
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c59b27', '#9b111e', '#f5d99b'],
      });
    } catch {
      // ignore
    }
    setIsDemoOrderPlaced(true);
  };

  const handleResetAfterOrder = () => {
    setIsDemoOrderPlaced(false);
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-stone-100 h-full flex flex-col shadow-luxury border-l border-stone-200 animate-slideUp sm:animate-none overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-red-800 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-50 tracking-wide">
                Your Order
              </h3>
              <p className="text-[11px] text-amber-200/80 font-medium">
                {diningMode === 'dine-in' ? `${tableNumber} • Dine In` : 'Takeaway Order'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Order Success View */}
        {isDemoOrderPlaced ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                Order Simulated • Phase 1
              </span>
              <h3 className="font-serif font-black text-2xl text-stone-900">
                Order Received!
              </h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Your order for <span className="font-bold text-stone-800">{tableNumber}</span>{' '}
                has been simulated for customer UI verification. In Phase 2, this triggers
                the backend payment gateway.
              </p>
            </div>

            <div className="w-full bg-white rounded-2xl p-4 border border-stone-200 text-left space-y-2 text-xs">
              <div className="flex justify-between font-medium text-stone-600">
                <span>Total Items:</span>
                <span className="font-bold text-stone-900">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <div className="flex justify-between font-serif text-sm">
                <span className="font-bold text-stone-900">Amount:</span>
                <span className="font-black text-brand-red-800">
                  ₹{billSummary.grandTotal}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetAfterOrder}
              className="w-full py-3 rounded-xl bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Start New Order
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              type="cart"
              onAction={() => setIsCartOpen(false)}
              actionText="Explore Dishes"
            />
          </div>
        ) : (
          /* Cart Items & Summary */
          <>
            {/* Dining Mode Quick Toggle */}
            <div className="bg-white px-4 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs shrink-0">
              <span className="font-semibold text-stone-600">Dining Mode:</span>
              <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setDiningMode('dine-in')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    diningMode === 'dine-in'
                      ? 'bg-brand-red-700 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Dine In
                </button>
                <button
                  type="button"
                  onClick={() => setDiningMode('takeaway')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    diningMode === 'takeaway'
                      ? 'bg-brand-red-700 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Takeaway
                </button>
              </div>
            </div>

            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <CartItem key={item.uniqueKey} item={item} />
              ))}

              <div className="pt-2">
                <BillSummary bill={billSummary} diningMode={diningMode} />
              </div>

              {/* NFC Kitchen Guarantee Badge */}
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="leading-snug">
                  Food is prepared fresh to order. Real-time kitchen tracking available upon ordering.
                </p>
              </div>
            </div>

            {/* Drawer Footer / Sticky CTA */}
            <div className="p-4 bg-white border-t border-stone-200 shadow-luxury space-y-3 shrink-0 safe-bottom">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-stone-500">
                  Grand Total
                </span>
                <span className="font-serif font-black text-xl text-stone-900">
                  ₹{billSummary.grandTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm tracking-wide shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
