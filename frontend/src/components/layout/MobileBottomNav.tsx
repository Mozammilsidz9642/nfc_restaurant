import { Home, Utensils, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../../context/useCart';

interface MobileBottomNavProps {
  onOpenTableModal?: () => void;
}

export function MobileBottomNav({ onOpenTableModal }: MobileBottomNavProps) {
  const {
    totalCount,
    setIsCartOpen,
    isTableOrderingEnabled,
    setIsTableModalOpen,
    tableNumber,
    diningMode,
  } = useCart();

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuClick = () => {
    const el = document.getElementById('explore-menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 px-3 py-1.5 flex items-center justify-around shadow-lg safe-bottom">
      {/* Home Tab */}
      <button
        type="button"
        onClick={handleHomeClick}
        className="flex flex-col items-center justify-center gap-0.5 text-red-800 py-1 px-3 cursor-pointer"
      >
        <Home className="w-5 h-5 text-red-800" />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      {/* Menu Tab */}
      <button
        type="button"
        onClick={handleMenuClick}
        className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-red-800 py-1 px-3 cursor-pointer"
      >
        <Utensils className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Menu</span>
      </button>

      {/* Cart Tab with Badge */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-red-800 py-1 px-3 cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-700 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {totalCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold">Cart</span>
      </button>

      {/* Table / Dining Tab or Phone Contact Tab */}
      {isTableOrderingEnabled ? (
        <button
          type="button"
          onClick={() => {
            if (onOpenTableModal) onOpenTableModal();
            else setIsTableModalOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-0.5 text-red-800 py-1 px-3 cursor-pointer"
        >
          <Utensils className="w-5 h-5 text-red-800" />
          <span className="text-[10px] font-bold truncate max-w-[60px]">
            {diningMode === 'dine-in' ? tableNumber : 'Dining'}
          </span>
        </button>
      ) : (
        <a
          href="tel:+917011377406"
          className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-red-800 py-1 px-3 cursor-pointer"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Call</span>
        </a>
      )}
    </div>
  );
}

