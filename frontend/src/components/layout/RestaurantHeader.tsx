import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Phone, MapPin, Clock } from 'lucide-react';
import { useCart } from '../../context/useCart';
import { RESTAURANT_INFO } from '../../data/mockMenu';

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
      {/* Top Notification / Contact Strip */}
      <div className="w-full bg-stone-950 text-stone-300 text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 border-b border-stone-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Address */}
          <div className="flex items-center gap-1.5 truncate text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {RESTAURANT_INFO.address}
            </span>
          </div>

          {/* Quick Call & Timings */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-1 text-stone-400">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{RESTAURANT_INFO.timing}</span>
            </div>
            <a
              href={`tel:${RESTAURANT_INFO.phoneClean}`}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors"
              title="Call NFC Noida Fried Chicken"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{RESTAURANT_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b ${
          isScrolled
            ? 'border-stone-200/90 shadow-md py-2 sm:py-2.5'
            : 'border-stone-200 py-2.5 sm:py-3'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Mobile: Hamburger Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Brand Logo & Name */}
          <button
            type="button"
            onClick={() => handleScrollTo('top')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            {/* Official 3D Badge Circular Logo */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-sm shrink-0 bg-stone-900 group-hover:scale-105 transition-transform ring-2 ring-amber-400/30">
              <img
                src={RESTAURANT_INFO.logo}
                alt="NFC - Noida Fried Chicken Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight leading-none flex items-center gap-1.5">
                <span>{RESTAURANT_INFO.name}</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-sm hidden sm:inline-block">
                  Greater Noida
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-red-800 leading-none mt-1">
                {RESTAURANT_INFO.tagline}
              </div>
            </div>
          </button>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-stone-700">
            <button
              type="button"
              onClick={() => handleScrollTo('top')}
              className="text-stone-900 hover:text-red-800 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('explore-menu')}
              className="hover:text-red-800 transition-colors cursor-pointer"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('offers-section')}
              className="hover:text-red-800 transition-colors cursor-pointer"
            >
              Offers
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('why-dine-with-us')}
              className="hover:text-red-800 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('footer-contact')}
              className="hover:text-red-800 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons: Call, Search, Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Call Pill */}
            <a
              href={`tel:${RESTAURANT_INFO.phoneClean}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/70 font-bold text-xs transition-colors"
              title="Call & Order"
            >
              <Phone className="w-3.5 h-3.5 text-red-800" />
              <span>{RESTAURANT_INFO.phone}</span>
            </a>

            {/* Search Trigger */}
            {onSearchClick && (
              <button
                type="button"
                onClick={onSearchClick}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSearchActive
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
                aria-label="Search dishes"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Cart Trigger with Bouncing Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-900 transition-transform active:scale-95 cursor-pointer border border-stone-200"
              aria-label={`Shopping cart with ${totalCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-700 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce ring-2 ring-white">
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
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-500/80 bg-stone-900 shrink-0">
                    <img
                      src={RESTAURANT_INFO.logo}
                      alt="NFC Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 text-base leading-none block">
                      {RESTAURANT_INFO.name}
                    </span>
                    <span className="block text-[8px] font-bold text-red-800 tracking-wider mt-0.5">
                      {RESTAURANT_INFO.fullName}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-2 font-semibold text-stone-700 text-sm">
                <button
                  type="button"
                  onClick={() => handleScrollTo('top')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-900 font-bold"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollTo('explore-menu')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50"
                >
                  Menu
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollTo('offers-section')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 flex items-center justify-between"
                >
                  <span>Special Offers</span>
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                    20% OFF
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollTo('why-dine-with-us')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50"
                >
                  About Us
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollTo('footer-contact')}
                  className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-50"
                >
                  Contact & Hours
                </button>
              </nav>

              {/* Call Direct Box */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Phone className="w-3.5 h-3.5 text-red-800" />
                  <span>Order Directly</span>
                </div>
                <a
                  href={`tel:${RESTAURANT_INFO.phoneClean}`}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Call {RESTAURANT_INFO.phone}</span>
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500 text-center space-y-1">
              <div className="font-semibold text-stone-700">{RESTAURANT_INFO.address}</div>
              <div>{RESTAURANT_INFO.timing}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
