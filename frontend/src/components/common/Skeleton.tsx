interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-stone-200/80 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs flex flex-row sm:flex-col gap-3">
      <Skeleton className="w-28 h-28 sm:w-full sm:h-44 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-2/3 h-4 rounded" />
          </div>
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-4/5 h-3 rounded" />
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
          <Skeleton className="w-16 h-5 rounded" />
          <Skeleton className="w-20 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-2.5 overflow-hidden py-2 px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-64 sm:h-80 bg-stone-900 rounded-3xl p-6 flex flex-col justify-end space-y-3">
      <Skeleton className="w-32 h-6 bg-stone-800 rounded-full" />
      <Skeleton className="w-3/4 h-8 bg-stone-800 rounded" />
      <Skeleton className="w-1/2 h-4 bg-stone-800 rounded" />
      <Skeleton className="w-28 h-10 bg-stone-800 rounded-xl" />
    </div>
  );
}

