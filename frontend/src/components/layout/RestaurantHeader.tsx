import { useState, useEffect } from 'react';
import { ChefHat, ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../context/useCart';

interface RestaurantHeaderProps {
  onSearchClick?: () => void;
  isSearchActive?: boolean;
}

export function RestaurantHeader({ onSearchClick, isSearchActive = false }: RestaurantHeaderProps) {
  const { totalCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white border-b ${
          isScrolled
            ? 'border-stone-200/90 shadow-sm py-2.5 sm:py-3'
            : 'border-stone-150 py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Mobile: Hamburger Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Brand Logo & Name */}
          <button
            onClick={() => handleScrollTo('top')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div>
              <div className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight leading-none">
                NFC
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-stone-500 leading-none mt-1">
                RESTAURANT
              </div>
            </div>
          </button>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <button
              onClick={() => handleScrollTo('top')}
              className="text-stone-900 hover:text-amber-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleScrollTo('explore-menu')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Menu
            </button>
            <button
              onClick={() => handleScrollTo('offers-section')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Offers
            </button>
            <button
              onClick={() => handleScrollTo('why-dine-with-us')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleScrollTo('footer-contact')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons: Search / Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSearchActive
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                aria-label="Search dishes"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Cart Trigger with Bouncing Red Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 transition-transform active:scale-95 cursor-pointer border border-stone-200/60"
              aria-label={`Shopping cart with ${totalCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce ring-2 ring-white">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 max-w-xs bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-slideRight"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 text-base">NFC</span>
                    <span className="block text-[8px] font-bold text-stone-400 tracking-wider">
                      RESTAURANT
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-2 font-semibold text-stone-700 text-sm">
                <button
                  onClick={() => handleScrollTo('top')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-900 font-bold"
                >
                  Home
                </button>
                <button
                  onClick={() => handleScrollTo('explore-menu')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50"
                >
                  Menu
                </button>
                <button
                  onClick={() => handleScrollTo('offers-section')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 flex items-center justify-between"
                >
                  <span>Special Offers</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    20% OFF
                  </span>
                </button>
                <button
                  onClick={() => handleScrollTo('why-dine-with-us')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50"
                >
                  About Us
                </button>
                <button
                  onClick={() => handleScrollTo('footer-contact')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50"
                >
                  Contact & Hours
                </button>
              </nav>

            </div>

            <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400 text-center">
              Noida Fried Chicken • Sector 18
            </div>
          </div>
        </div>
      )}

    </>
  );
}
