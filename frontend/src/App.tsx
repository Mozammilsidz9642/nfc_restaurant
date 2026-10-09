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
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';

const API_BASE = 'http://localhost:5000/api';

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

function CustomerApp() {
  return (
    <CartProvider>
      <MenuAppContent />
    </CartProvider>
  );
}

type TrackedOrder = {
  orderId: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  items: { name: string; size: string; quantity: number }[];
  totalAmount: number;
  riderName?: string;
  riderPhone?: string;
  createdAt?: string;
};

function OrderTrackingPage() {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderId)}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Order could not be found.');
        if (!cancelled) {
          setOrder(result as TrackedOrder);
          setError('');
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Unable to load order status.');
      }
    };
    void fetchOrder();
    const poll = window.setInterval(() => void fetchOrder(), 12_000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [orderId]);

  const steps = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const activeStep = steps.indexOf(order?.status || '');

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900">
      <section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
        <div className="bg-stone-950 px-6 py-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">NFC Order Tracking</p>
          <h1 className="mt-2 font-serif text-2xl font-black">{order?.orderId || orderId}</h1>
          <p className="mt-1 text-xs text-stone-300">This page refreshes automatically every 12 seconds.</p>
        </div>
        <div className="p-6 sm:p-8">
          {error && !order ? (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : !order ? (
            <p className="py-8 text-center text-sm text-stone-500">Loading your order status…</p>
          ) : (
            <>
              <div className="mb-7 rounded-2xl bg-amber-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800">Current Status</p>
                <p className="mt-1 font-serif text-2xl font-black text-stone-900">{order.status}</p>
              </div>
              <ol className="space-y-4">
                {steps.map((step, index) => {
                  const complete = activeStep >= index;
                  return <li key={step} className="flex items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${complete ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'}`}>{complete ? '✓' : index + 1}</span><span className={`text-sm font-bold ${complete ? 'text-stone-900' : 'text-stone-400'}`}>{step}</span></li>;
                })}
              </ol>
              {order.status === 'Out for Delivery' && order.riderName && <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-bold text-blue-900">Your rider: {order.riderName}</p>{order.riderPhone && <a className="mt-1 inline-block text-blue-700 underline" href={`tel:${order.riderPhone}`}>{order.riderPhone}</a>}</div>}
              <div className="mt-7 border-t border-stone-100 pt-5"><p className="text-xs font-black uppercase tracking-wider text-stone-400">Delivery to</p><p className="mt-1 text-sm text-stone-700">{order.deliveryAddress}</p><ul className="mt-4 space-y-1 text-xs text-stone-600">{order.items?.map((item, index) => <li key={`${item.name}-${index}`}>{item.quantity}× {item.name} ({item.size})</li>)}</ul><p className="mt-4 font-serif text-lg font-black">Total paid: ₹{order.totalAmount}</p></div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/track/:orderId" element={<OrderTrackingPage />} />
        <Route path="*" element={<main className="min-h-screen bg-stone-100 p-10 text-center text-stone-700">Page not found.</main>} />
      </Routes>
    </BrowserRouter>
  );
}
