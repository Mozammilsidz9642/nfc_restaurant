import { useState } from 'react';
import { Plus, Minus, Heart } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { VegBadge } from '../common/VegBadge';
import { useCart } from '../../context/useCart';

interface ProductCardProps {
  item: MenuItem;
  onOpenDetails: (item: MenuItem) => void;
}

export function ProductCard({ item, onOpenDetails }: ProductCardProps) {
  const { cart, addToCart, updateQty } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fallback food image
  const fallbackImg =
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';

  const isAvailable = Boolean(item.isAvailable ?? item.available ?? true);
  const displayImage = item.imageUrl || item.image || fallbackImg;

  // Find lowest price
  const prices = item.variants.map((v) => v.price);
  const lowestPrice = Math.min(...prices);
  const hasMultipleVariants = item.variants.length > 1;

  // Check how many items of this dish are in cart
  const cartEntriesForItem = cart.filter(
    (c) => c.itemId === item.id || c.itemId === item._id
  );
  const totalInCart = cartEntriesForItem.reduce((sum, c) => sum + c.quantity, 0);

  // Badge determination: Bestseller or Popular
  const isBestseller = item.badges?.some(
    (b) => b.toLowerCase().includes('bestseller') || b.toLowerCase().includes('special')
  );
  const isPopular = item.rating && item.rating >= 4.8 && !isBestseller;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (hasMultipleVariants) {
      onOpenDetails(item);
    } else {
      addToCart(item, item.variants[0], 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (cartEntriesForItem.length === 1) {
      updateQty(cartEntriesForItem[0].uniqueKey, 1);
    } else {
      onOpenDetails(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (cartEntriesForItem.length === 1) {
      updateQty(cartEntriesForItem[0].uniqueKey, -1);
    } else {
      onOpenDetails(item);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP / TABLET CARD VIEW (Visible on sm and larger)     */}
      {/* ========================================================= */}
      <article
        onClick={() => {
          if (isAvailable) onOpenDetails(item);
        }}
        className={`hidden sm:flex group bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 flex-col h-full justify-between overflow-hidden relative ${
          isAvailable
            ? 'border-stone-200/90 hover:border-amber-400 hover:shadow-2xl hover:shadow-stone-900/10 hover:-translate-y-1.5 cursor-pointer'
            : 'border-stone-200 bg-stone-50/80 opacity-75 cursor-not-allowed'
        }`}
      >
        {/* Top Media Area with strict uniform height constraint */}
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-stone-100 p-2.5 pb-0 shrink-0">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-200">
            <img
              src={imgError ? fallbackImg : displayImage}
              alt={item.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                isAvailable ? 'group-hover:scale-110 group-hover:brightness-105' : 'grayscale'
              }`}
            />

            {/* Subtle luxury ambient vignette on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Sold Out Overlay */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-stone-950/65 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                <span className="px-3.5 py-1 rounded-full bg-red-800/95 text-white font-bold text-xs uppercase tracking-wider border border-white/30 shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Top-Left Badges: Veg Indicator + Bestseller / Popular */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none z-10">
              <VegBadge isVeg={item.isVeg} size="sm" />
              {isBestseller ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[10px] tracking-wide shadow-sm">
                  Bestseller
                </span>
              ) : isPopular ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-700 text-white font-extrabold text-[10px] tracking-wide shadow-sm">
                  Popular
                </span>
              ) : null}
            </div>

            {/* Top-Right Favorite Heart Button */}
            <button
              type="button"
              onClick={toggleFavorite}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-red-600 hover:scale-110 active:scale-90 transition-all shadow-md cursor-pointer z-20 border border-white/60"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-red-600 text-red-600' : 'text-stone-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Content Area with strict normalized height */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                {item.category}
              </span>
            </div>
            <h3 className="font-extrabold text-stone-900 text-base sm:text-lg group-hover:text-red-800 transition-colors leading-snug line-clamp-1 h-6 sm:h-7">
              {item.name}
            </h3>
            <p className="text-xs text-stone-500 line-clamp-2 h-9 sm:h-10 mt-1 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          {/* Pricing & Add/Stepper Row - strictly anchored at bottom */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-stone-100 mt-auto">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-lg sm:text-xl text-stone-900">
                  ₹{lowestPrice}
                </span>
                {hasMultipleVariants && (
                  <span className="text-[11px] text-stone-400 font-medium">
                    /{item.variants[0].size}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isAvailable ? (
              <button
                type="button"
                disabled
                className="px-3 py-1.5 rounded-full bg-stone-200 text-stone-500 font-bold text-xs uppercase cursor-not-allowed"
                aria-label={`${item.name} is out of stock`}
              >
                Out of Stock
              </button>
            ) : totalInCart > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-red-800 to-amber-700 text-white px-1 py-0.5 shadow-md shadow-red-950/20"
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="w-6 text-center font-black text-xs">
                  {totalInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs tracking-wide flex items-center gap-1 shadow-md shadow-red-950/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Add</span>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </article>

      {/* ========================================================= */}
      {/* MOBILE HORIZONTAL DISH CARD                               */}
      {/* ========================================================= */}
      <article
        onClick={() => {
          if (isAvailable) onOpenDetails(item);
        }}
        className={`sm:hidden bg-white rounded-2xl border p-3 flex gap-3.5 items-center transition-all duration-200 ${
          isAvailable
            ? 'border-stone-200/90 shadow-2xs active:bg-stone-50 cursor-pointer active:scale-[0.99]'
            : 'border-stone-200 bg-stone-50/70 opacity-75'
        }`}
      >
        {/* Left Thumbnail Photo with fixed size */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-stone-100">
          <img
            src={imgError ? fallbackImg : displayImage}
            alt={item.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className={`w-full h-full object-cover object-center ${isAvailable ? '' : 'grayscale'}`}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold uppercase text-center p-1">
              Out of Stock
            </div>
          )}
          <div className="absolute top-1 left-1">
            <VegBadge isVeg={item.isVeg} size="sm" />
          </div>
        </div>

        {/* Right Info + Price & Add with fixed height container */}
        <div className="flex-1 flex flex-col justify-between h-24 min-w-0">
          <div className="relative pr-6">
            <h3 className="font-extrabold text-stone-900 text-sm leading-snug truncate">
              {item.name}
            </h3>
            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-tight">
              {item.description}
            </p>

            {/* Heart Favorite Top-Right */}
            <button
              type="button"
              onClick={toggleFavorite}
              className="absolute top-0 right-0 p-1 text-stone-400 hover:text-red-600 active:scale-90"
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorite ? 'fill-red-600 text-red-600' : 'text-stone-400'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-100">
            <span className="font-black text-sm text-stone-900">
              ₹{lowestPrice}
            </span>

            {/* Action Button */}
            {!isAvailable ? (
              <button
                type="button"
                disabled
                className="rounded-full bg-stone-200 px-2.5 py-1 text-[10px] font-bold uppercase text-stone-500 cursor-not-allowed"
                aria-label={`${item.name} is out of stock`}
              >
                Out of Stock
              </button>
            ) : totalInCart > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-red-800 to-amber-700 text-white px-1 py-0.5 shadow-sm"
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-5 h-5 rounded-full hover:bg-black/20 flex items-center justify-center active:scale-90"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                <span className="w-5 text-center font-black text-xs">
                  {totalInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-5 h-5 rounded-full hover:bg-black/20 flex items-center justify-center active:scale-90"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="px-3.5 py-1 rounded-full bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs tracking-wide flex items-center gap-1 active:scale-95 shadow-xs"
              >
                <span>Add</span>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
