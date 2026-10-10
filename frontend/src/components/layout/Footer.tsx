import { Award, UtensilsCrossed, Users, Smartphone, Clock, MapPin, ShieldCheck, Phone, MessageCircle, ExternalLink, Heart } from 'lucide-react';
import { RESTAURANT_INFO } from '../../data/mockMenu';

const WHY_DINE_FEATURES = [
  {
    title: 'Signature Taste',
    subtitle: 'Crispy fried & authentic charcoal tandoor',
    icon: Award,
  },
  {
    title: 'Royal Mughlai & Fast Food',
    subtitle: 'Biryanis, Kebabs, Rolls & Curries',
    icon: UtensilsCrossed,
  },
  {
    title: 'Family & Friends Friendly',
    subtitle: 'Cozy dine-in & swift takeaway in Alpha-2',
    icon: Users,
  },
  {
    title: 'NFC Instant Ordering',
    subtitle: 'Scan table NFC/QR, customize & pay fast',
    icon: Smartphone,
  },
];

export function Footer() {
  const handleScrollTo = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'NFC Noida Fried Chicken KB Complex Sector Alpha-2 Greater Noida'
  )}`;

  return (
    <footer id="why-dine-with-us" className="w-full bg-[#111215] text-white border-t border-stone-800 pt-12 pb-28 sm:pb-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Why Dine With Us Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block mb-1">
                The NFC Promise
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Why Dine With Us?
              </h3>
            </div>
            <p className="text-xs text-stone-400 font-normal max-w-sm">
              Authentic secret marinations, premium whole spices, and hygienic food prepared fresh on every single order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_DINE_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 hover:border-amber-500/50 transition-all duration-300 shadow-lg group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-900/50 to-amber-900/40 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white leading-snug group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-400 font-normal mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restaurant Contact, Official Address & Metadata */}
        <div id="footer-contact" className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-10 border-t border-stone-800 text-xs">
          {/* Col 1: Brand Info with Official Logo (Col span 5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shrink-0 bg-stone-950 ring-2 ring-amber-500/30">
                <img
                  src={RESTAURANT_INFO.logo}
                  alt="NFC - Noida Fried Chicken Official Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-wide block leading-tight">
                  {RESTAURANT_INFO.name} — {RESTAURANT_INFO.fullName}
                </span>
                <span className="text-xs font-extrabold text-amber-400 tracking-wider">
                  {RESTAURANT_INFO.tagline}
                </span>
              </div>
            </div>

            <p className="text-stone-300 leading-relaxed text-xs font-normal pr-4">
              Serving the finest crispy fried chicken, tender smoky tandoori kebabs, slow-cooked royal Awadhi biryani, and rich Mughlai curries in Greater Noida.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Halal Certified</span>
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-[11px] text-stone-400 font-medium">
                FSSAI {RESTAURANT_INFO.fssai}
              </span>
            </div>
          </div>

          {/* Col 2: Official Address & Visit Details (Col span 4) */}
          <div className="md:col-span-4 space-y-3.5 text-stone-300">
            <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Restaurant Address</span>
            </h4>

            <div className="bg-stone-900/80 rounded-2xl p-4 border border-stone-800 space-y-3">
              <div>
                <p className="font-bold text-white text-sm leading-snug">
                  {RESTAURANT_INFO.address}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Near Alpha Commercial Belt, Greater Noida, Uttar Pradesh
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 text-stone-300 border-t border-stone-800/80">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium">{RESTAURANT_INFO.timing}</span>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors pt-1"
              >
                <span>Get Directions on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 3: Direct Phone & Order CTAs (Col span 3) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Order Direct</span>
            </h4>

            <div className="space-y-2.5">
              {/* Call Button */}
              <a
                href={`tel:${RESTAURANT_INFO.phoneClean}`}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all active:scale-95 cursor-pointer border border-amber-500/30"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {RESTAURANT_INFO.phone}</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/917011377406?text=${encodeURIComponent(
                  'Hi NFC Noida Fried Chicken! I want to order food from KB Complex Alpha-2 outlet.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Order</span>
              </a>

              {/* Quick links to categories */}
              <div className="pt-2 text-[11px] text-stone-400 space-y-1">
                <span className="block font-bold text-stone-300 text-xs">Quick Menu:</span>
                <div className="flex flex-wrap gap-2 text-stone-400">
                  <button
                    type="button"
                    onClick={() => handleScrollTo('explore-menu')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Starters
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleScrollTo('explore-menu')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Biryani
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleScrollTo('explore-menu')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Main Course
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleScrollTo('explore-menu')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Breads
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Security Strip */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <div>
            © {new Date().getFullYear()} <span className="text-white font-bold">{RESTAURANT_INFO.fullName}</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600 inline" />
            <span>for food lovers in Greater Noida • Smart NFC Table Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
