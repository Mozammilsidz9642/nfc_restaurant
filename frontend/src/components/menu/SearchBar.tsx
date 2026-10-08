import { useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  filterVegOnly: boolean | null; // null: all, true: veg, false: non-veg
  onFilterVegChange: (filter: boolean | null) => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  isExpanded,
  onToggleExpand,
  filterVegOnly,
  onFilterVegChange,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    onSearchChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full transition-all duration-300">
      {/* Search Input Box */}
      <div
        className={`relative flex items-center bg-white rounded-2xl border transition-all duration-200 shadow-2xs ${
          isExpanded || searchQuery
            ? 'border-brand-red-700/40 ring-2 ring-brand-red-700/15'
            : 'border-stone-200 hover:border-stone-300'
        }`}
      >
        <div className="pl-3.5 pr-2 text-stone-400 shrink-0">
          <Search className="w-4 h-4 text-stone-500" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes... (e.g. Biryani, Kebab, Roti, Butter Chicken)"
          className="w-full py-2.5 sm:py-3 pr-9 text-xs sm:text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-hidden"
        />

        {searchQuery ? (
          <button
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : onToggleExpand ? (
          <button
            onClick={onToggleExpand}
            className="hidden sm:inline-flex items-center text-[11px] text-stone-400 pr-3 font-medium"
          >
            ESC
          </button>
        ) : null}
      </div>

      {/* Quick Diet Filters */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => onFilterVegChange(null)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
            filterVegOnly === null
              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
          }`}
        >
          All Flavours
        </button>

        <button
          onClick={() => onFilterVegChange(false)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            filterVegOnly === false
              ? 'bg-brand-red-700 text-white border-brand-red-700 shadow-2xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-red-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span>Non-Veg Specials</span>
        </button>

        <button
          onClick={() => onFilterVegChange(true)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            filterVegOnly === true
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Pure Veg</span>
        </button>

        <div className="ml-auto hidden md:flex items-center gap-1 text-[11px] text-stone-400 pl-2">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Real-time instant search</span>
        </div>
      </div>
    </div>
  );
}

