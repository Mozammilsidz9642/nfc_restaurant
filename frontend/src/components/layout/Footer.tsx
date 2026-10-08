import { Award, UtensilsCrossed, Users, Smartphone, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { RESTAURANT_INFO } from '../../data/mockMenu';

const WHY_DINE_FEATURES = [
  {
    title: 'Premium Quality',
    subtitle: 'Fresh & Best Ingredients',
    icon: Award,
  },
  {
    title: 'Multiple Cuisines',
    subtitle: 'Something for Everyone',
    icon: UtensilsCrossed,
  },
  {
    title: 'Great Ambience',
    subtitle: 'Perfect for Family & Friends',
    icon: Users,
  },
  {
    title: 'Easy Ordering',
    subtitle: 'Quick & Hassle Free',
    icon: Smartphone,
  },
];

export function Footer() {
  return (
    <footer id="why-dine-with-us" className="w-full bg-[#f8f9fa] border-t border-stone-200/90 pt-10 pb-24 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Why Dine With Us Section Header & Cards */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Why Dine With Us?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {WHY_DINE_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-2xs flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 leading-snug truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restaurant Contact & Metadata */}
        <div id="footer-contact" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-stone-200/80 text-xs">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-600 text-sm">
                NFC
              </div>
              <span className="font-extrabold text-base text-stone-900 tracking-wide">
                {RESTAURANT_INFO.fullName}
              </span>
            </div>
            <p className="text-stone-500 leading-relaxed font-normal">
              {RESTAURANT_INFO.heroSubtitle}
            </p>
          </div>

          {/* Location & Timings */}
          <div className="space-y-2.5 text-stone-600">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
              Visit & Dine
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{RESTAURANT_INFO.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{RESTAURANT_INFO.timing}</span>
            </div>
          </div>

          {/* Standards & FSSAI */}
          <div className="space-y-2.5 text-stone-600">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
              Kitchen Standards
            </h4>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Halal Certified • Fresh Daily Ingredients</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              FSSAI: {RESTAURANT_INFO.fssai}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-stone-200/80 text-center text-[11px] text-stone-400">
          © {new Date().getFullYear()} {RESTAURANT_INFO.fullName}. All rights reserved. Powered by NFC Smart Table Ordering.
        </div>
      </div>
    </footer>
  );
}
