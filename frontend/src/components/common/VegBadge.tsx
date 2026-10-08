interface VegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function VegBadge({ isVeg, size = 'sm', showLabel = false, className = '' }: VegBadgeProps) {
  const dimensionClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const dotClass = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size];

  if (isVeg) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${dimensionClass} border-2 border-emerald-600 rounded flex items-center justify-center p-0.5 bg-white/90 shadow-2xs`}
          title="Vegetarian"
          aria-label="Vegetarian"
        >
          <div className={`${dotClass} rounded-full bg-emerald-600`}></div>
        </div>
        {showLabel && <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Veg</span>}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className={`${dimensionClass} border-2 border-red-700 rounded flex items-center justify-center p-0.5 bg-white/90 shadow-2xs`}
        title="Non-Vegetarian"
        aria-label="Non-Vegetarian"
      >
        <div className={`${dotClass} rounded-full bg-red-700`}></div>
      </div>
      {showLabel && <span className="text-xs font-semibold text-red-800 tracking-wide uppercase">Non-Veg</span>}
    </div>
  );
}

