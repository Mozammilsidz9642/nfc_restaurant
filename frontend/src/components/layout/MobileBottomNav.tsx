import { Home, Utensils, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/useCart';

interface MobileBottomNavProps {
  onOpenTableModal?: () => void;
}

export function MobileBottomNav({ onOpenTableModal }: MobileBottomNavProps) {
  const { totalCount, setIsCartOpen } = useCart();

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
        onClick={handleHomeClick}
        className="flex flex-col items-center justify-center gap-0.5 text-stone-700 hover:text-amber-600 py-1 px-3"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      {/* Menu Tab */}
      <button
        onClick={handleMenuClick}
        className="flex flex-col items-center justify-center gap-0.5 text-stone-500 hover:text-amber-600 py-1 px-3"
      >
        <Utensils className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Menu</span>
      </button>

      {/* Cart Tab with Badge */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center gap-0.5 text-stone-500 hover:text-amber-600 py-1 px-3"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {totalCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold">Cart</span>
      </button>

      {/* Profile / Table Tab */}
      <button
        onClick={onOpenTableModal}
        className="flex flex-col items-center justify-center gap-0.5 text-stone-500 hover:text-amber-600 py-1 px-3"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Profile</span>
      </button>
    </div>
  );
}

