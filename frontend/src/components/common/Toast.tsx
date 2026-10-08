import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../../context/useCart';

export function Toast() {
  const { toast, hideToast } = useCart();

  if (!toast || !toast.visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto bg-stone-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-luxury border border-amber-500/30 flex items-center justify-between gap-3 animate-slide-up">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold text-stone-100 truncate">
            {toast.message}
          </p>
        </div>
        <button
          onClick={hideToast}
          className="text-stone-400 hover:text-white p-1 rounded-lg shrink-0 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
