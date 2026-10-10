import { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CategoryName } from '../../types/menu';

interface CategoryNavProps {
  categories: readonly CategoryName[];
  selectedCategory: CategoryName;
  onSelectCategory: (category: CategoryName) => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORY_IMAGES: Record<string, string> = {
  All: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=160&q=80',
  Biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=160&q=80',
  Starters: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=160&q=80',
  'Main Course': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=160&q=80',
  'Roti / Bread': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=160&q=80',
  Breads: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=160&q=80',
  'Rice & Daal': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=160&q=80',
  Sides: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=160&q=80',
};

export function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active category into visible view
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeBtnRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedCategory]);

  return (
    <section id="explore-menu" className="w-full pt-8 sm:pt-10 pb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header: Explore Our Menu + View All */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Explore Our Menu
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
              Discover a variety of delicious dishes made with love
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('All')}
            className="group hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer py-1 px-3 rounded-full hover:bg-amber-50"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Circular Category Buttons Scroll Strip */}
        <div
          ref={containerRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = categoryCounts ? categoryCounts[cat] : undefined;
            const imgSrc =
              CATEGORY_IMAGES[cat] ||
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=160&q=80';

            return (
              <button
                key={cat}
                ref={isActive ? activeBtnRef : null}
                onClick={() => onSelectCategory(cat)}
                className={`flex flex-col items-center gap-2 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer shrink-0 min-w-[76px] sm:min-w-[88px] ${
                  isActive
                    ? 'bg-amber-100/90 border border-amber-300 text-stone-900 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-600 shadow-2xs'
                }`}
              >
                {/* Circular dish preview thumbnail */}
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden transition-transform duration-200 ${
                    isActive
                      ? 'ring-2 ring-amber-500 scale-105'
                      : 'border border-stone-200'
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={cat}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>

                {/* Category label */}
                <span
                  className={`text-xs font-bold tracking-tight text-center truncate max-w-[80px] ${
                    isActive ? 'text-stone-900' : 'text-stone-700'
                  }`}
                >
                  {cat === 'Roti / Bread' ? 'Roti' : cat}
                </span>

                {count !== undefined && (
                  <span
                    className={`text-[10px] -mt-1 font-semibold px-1.5 rounded-full ${
                      isActive
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
