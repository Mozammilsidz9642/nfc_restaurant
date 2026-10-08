import { useMemo } from 'react';
import type { MenuItem, CategoryName } from '../../types/menu';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';
import { ArrowRight } from 'lucide-react';

interface ProductGridProps {
  items: MenuItem[];
  selectedCategory: CategoryName;
  searchQuery: string;
  filterVegOnly: boolean | null;
  onOpenDetails: (item: MenuItem) => void;
  onResetFilters: () => void;
  onViewAll?: () => void;
}

export function ProductGrid({
  items,
  selectedCategory,
  searchQuery,
  filterVegOnly,
  onOpenDetails,
  onResetFilters,
  onViewAll,
}: ProductGridProps) {
  // Normalize category name for breads (handles both "Roti / Bread" and backend "Breads")
  const matchesCategory = (itemCat: string, targetCat: CategoryName) => {
    if (targetCat === 'All') return true;
    if (targetCat === 'Roti / Bread') {
      return itemCat === 'Roti / Bread' || itemCat === 'Breads' || itemCat === 'Bread';
    }
    return itemCat.toLowerCase() === targetCat.toLowerCase();
  };

  // Filter items based on category, search text, and veg/non-veg selection
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Category check
      if (!matchesCategory(item.category, selectedCategory)) {
        return false;
      }

      // 2. Dietary filter check
      if (filterVegOnly !== null && item.isVeg !== filterVegOnly) {
        return false;
      }

      // 3. Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const catMatch = item.category.toLowerCase().includes(query);
        const badgeMatch = item.badges?.some((b) => b.toLowerCase().includes(query));
        if (!nameMatch && !descMatch && !catMatch && !badgeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, filterVegOnly, searchQuery]);

  if (filteredItems.length === 0) {
    return (
      <div className="py-12 bg-white rounded-3xl border border-stone-200">
        <EmptyState
          type="search"
          title="No culinary matches found"
          description={
            searchQuery
              ? `We couldn't find any dish matching "${searchQuery}". Try searching for Kebabs, Biryani, or Roti.`
              : 'No items currently match your chosen dietary preference.'
          }
          actionText="Clear Filters"
          onAction={onResetFilters}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-only "Popular Dishes" header (matching right side of reference image) */}
      <div className="flex sm:hidden items-center justify-between pt-2 pb-1">
        <h3 className="font-extrabold text-lg text-stone-900">
          Popular Dishes
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Dishes: 
          On Mobile: 1 column vertical stack of horizontal cards 
          On Tablet: 2 columns 
          On Desktop: 3 columns vertical cards 
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {filteredItems.map((item) => (
          <ProductCard
            key={item.id || item._id}
            item={item}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </div>
  );
}
