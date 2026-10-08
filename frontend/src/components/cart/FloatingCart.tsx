import { ArrowRight } from 'lucide-react';
import { useCart } from '../../context/useCart';

export function FloatingCart() {
  const { totalCount, itemsTotal, setIsCartOpen, cart } = useCart();

  if (totalCount === 0) return null;

  // Grab the image of the first item in cart as preview
  const firstItemImage =
    cart[0]?.image ||
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-full bg-[#18191c]/95 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-750 flex items-center justify-between gap-3 animate-slideUp active:scale-98 transition-all duration-200 cursor-pointer group"
          aria-label={`View Cart with ${totalCount} items totaling ₹${itemsTotal}`}
        >
          {/* Left: Thumbnail & Total Items */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-700 shrink-0">
              <img
                src={firstItemImage}
                alt="Order preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <span className="text-[11px] text-stone-400 font-medium block">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                ₹{itemsTotal}
              </span>
            </div>
          </div>

          {/* Right: Orange 'View Cart →' Pill Button */}
          <div className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md transition-all group-hover:pr-3.5">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>
    </div>
  );
}
