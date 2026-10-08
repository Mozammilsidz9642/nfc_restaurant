import { useState, useEffect, useMemo, useRef } from 'react';
import { CartProvider } from './context/CartContext';
import { RestaurantHeader } from './components/layout/RestaurantHeader';
import { HeroSection } from './components/layout/HeroSection';
import { TrustFeaturesBar } from './components/layout/TrustFeaturesBar';
import { Footer } from './components/layout/Footer';
import { CategoryNav } from './components/menu/CategoryNav';
import { SearchBar } from './components/menu/SearchBar';
import { ProductGrid } from './components/menu/ProductGrid';
import { PromoSidebar } from './components/menu/PromoSidebar';
import { ProductDetailSheet } from './components/menu/ProductDetailSheet';
import { FloatingCart } from './components/cart/FloatingCart';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { Toast } from './components/common/Toast';
import { EmptyState } from './components/common/EmptyState';
import { ProductCardSkeleton, CategorySkeleton, HeroSkeleton } from './components/common/Skeleton';
import { menuApi } from './services/menuApi';
import { CATEGORIES } from './data/mockMenu';
import type { MenuItem, CategoryName } from './types/menu';
import { AlertCircle, RefreshCw } from 'lucide-react';

function MenuAppContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean | null>(null);
  const [activeItemDetails, setActiveItemDetails] = useState<MenuItem | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Load menu items directly from backend API
  useEffect(() => {
    let isCancelled = false;
    menuApi
      .getMenu()
      .then((items) => {
        if (!isCancelled) {
          setMenuItems(items);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.error('Failed to fetch menu:', err);
          const msg = err instanceof Error ? err.message : 'Unable to connect to restaurant server.';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    menuApi
      .getMenu()
      .then((items) => {
        setMenuItems(items);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch menu:', err);
        const msg = err instanceof Error ? err.message : 'Unable to connect to restaurant server.';
        setError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Compute category count map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menuItems.length };
    for (const cat of CATEGORIES) {
      if (cat === 'All') continue;
      counts[cat] = menuItems.filter((i) => {
        if (cat === 'Roti / Bread') {
          return i.category === 'Roti / Bread' || i.category === 'Breads' || i.category === 'Bread';
        }
        return i.category.toLowerCase() === cat.toLowerCase();
      }).length;
    }
    return counts;
  }, [menuItems]);

  const handleHeaderSearchClick = () => {
    setIsSearchActive(true);
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterVegOnly(null);
    setSelectedCategory('All');
  };

  const handleViewCombos = () => {
    setSelectedCategory('Biryani');
    const el = document.getElementById('explore-menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900">
      {/* Toast Notification */}
      <Toast />

      {/* Header matching reference mockup */}
      <RestaurantHeader
        onSearchClick={handleHeaderSearchClick}
        isSearchActive={isSearchActive}
      />

      {/* Hero Section */}
      {isLoading ? <HeroSkeleton /> : <HeroSection />}

      {/* 4 Trust & Feature Strip */}
      <TrustFeaturesBar />

      {/* Category Navigation Bar */}
      {isLoading ? (
        <CategorySkeleton />
      ) : (
        <CategoryNav
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
          }}
          categoryCounts={categoryCounts}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Search & Dietary Filters Container */}
        <div ref={searchSectionRef}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isExpanded={isSearchActive}
            onToggleExpand={() => setIsSearchActive(false)}
            filterVegOnly={filterVegOnly}
            onFilterVegChange={setFilterVegOnly}
          />
        </div>

        {/* Desktop Progressive Layout: 3 Columns Dishes + 1 Column Promo Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
          {/* Dishes Area (Span 3 on Desktop, full width on Mobile/Tablet) */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 px-6 bg-white rounded-3xl border border-stone-200 shadow-sm text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-stone-900">
                    Unable to Load Menu
                  </h3>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  type="menu"
                  title="Menu currently unavailable"
                  description="The kitchen is currently updating the digital menu. Please check back shortly."
                  actionText="Refresh Menu"
                  onAction={handleRetry}
                />
              </div>
            ) : (
              <ProductGrid
                items={menuItems}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                filterVegOnly={filterVegOnly}
                onOpenDetails={(item) => setActiveItemDetails(item)}
                onResetFilters={handleResetFilters}
                onViewAll={handleResetFilters}
              />
            )}
          </div>

          {/* Desktop Right Sidebar: Promo Cards (Hidden on mobile, matching desktop reference) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <PromoSidebar onViewCombos={handleViewCombos} />
          </div>
        </div>
      </main>

      {/* Footer / Why Dine With Us */}
      <Footer />

      {/* Floating Cart Preview Pill */}
      <FloatingCart />

      {/* Mobile Bottom Navigation Bar (Home, Menu, Cart, Profile) */}
      <MobileBottomNav />

      {/* Product Detail Customization Modal / Bottom Sheet */}
      <ProductDetailSheet
        item={activeItemDetails}
        onClose={() => setActiveItemDetails(null)}
      />

      {/* Cart Drawer / Bottom Sheet */}
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MenuAppContent />
    </CartProvider>
  );
}