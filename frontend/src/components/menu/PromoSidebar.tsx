import { useState } from 'react';
import { ArrowRight, Copy, Check, Sparkles } from 'lucide-react';

interface PromoSidebarProps {
  onViewCombos?: () => void;
}

export function PromoSidebar({ onViewCombos }: PromoSidebarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('NFC20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside id="offers-section" className="space-y-6">
      {/* Promo Card 1: Special Combo Offers */}
      <div className="bg-[#16171a] border border-stone-800 rounded-3xl p-5 text-white shadow-lg overflow-hidden relative group">
        <div className="relative z-10 space-y-3">
          <div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              Special <br />
              Combo Offers
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Delicious Combos at Best Prices
            </p>
          </div>

          {/* Dish Image */}
          <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden my-3 border border-stone-800">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
              alt="Special Combo Feast"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>

          <button
            onClick={onViewCombos}
            className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>View Combos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Promo Card 2: Flat 20% OFF */}
      <div className="bg-[#16171a] border border-stone-800 rounded-3xl p-5 text-white shadow-lg overflow-hidden relative group">
        <div className="relative z-10 space-y-3">
          <div>
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Limited Deal</span>
            </div>
            <h3 className="font-black text-2xl text-white tracking-tight">
              Flat <br />
              <span className="text-amber-400">20% OFF</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              On Your First Order
            </p>
          </div>

          {/* Coupon Code Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-900 border border-stone-700/80">
            <div className="text-left">
              <span className="text-[10px] text-stone-400 block font-medium">Coupon Code</span>
              <span className="font-mono font-black text-amber-300 text-xs tracking-wider">
                NFC20
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
              title="Copy Coupon Code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Feast Image */}
          <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden my-2 border border-stone-800">
            <img
              src="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80"
              alt="Tandoori Feast 20% OFF"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

