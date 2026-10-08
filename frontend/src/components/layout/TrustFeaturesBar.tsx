import { ShieldCheck, ChefHat, Clock, Users } from 'lucide-react';

interface TrustFeature {
  title: string;
  subtitle: string;
  icon: typeof ShieldCheck;
}

const FEATURES: TrustFeature[] = [
  {
    title: 'Fresh Ingredients',
    subtitle: 'Always Fresh',
    icon: ShieldCheck,
  },
  {
    title: 'Hygienic Kitchen',
    subtitle: '100% Safe',
    icon: ChefHat,
  },
  {
    title: 'Quick Service',
    subtitle: 'Hot & Fresh',
    icon: Clock,
  },
  {
    title: 'Family Friendly',
    subtitle: 'Great Ambiance',
    icon: Users,
  },
];

export function TrustFeaturesBar() {
  return (
    <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg shadow-stone-900/5 border border-stone-150">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`flex items-center gap-3 py-1.5 sm:py-0 ${
                  idx > 0 ? 'sm:pl-4' : ''
                }`}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">
                    {feat.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate">
                    {feat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

