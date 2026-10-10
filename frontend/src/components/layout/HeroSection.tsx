import { useState } from 'react';
import { ArrowRight, Phone, MapPin, Sparkles } from 'lucide-react';
import { RESTAURANT_INFO } from '../../data/mockMenu';

interface HeroSectionProps {
  onExploreClick?: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScrollToMenu = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const menuEl = document.getElementById('explore-menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#101014] text-white pt-8 pb-14 sm:py-16 md:py-20 border-b border-stone-800/80">
      {/* Background ambient warmth with golden amber and deep crimson glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text, Badges, CTAs */}
          <div className="md:col-span-7 flex flex-col items-start justify-center">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-wide mb-3 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{RESTAURANT_INFO.tagline}</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-300 font-medium">Alpha-2 Greater Noida</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1] mb-3 sm:mb-4">
              Noida Fried Chicken <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                Good Food, Great Mood
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-300 font-normal max-w-lg leading-relaxed mb-4 sm:mb-6">
              Crispy fried chicken, royal Awadhi biryanis & rich charcoal-grilled tandoori kebabs, freshly prepared for your table.
            </p>

            {/* Restaurant Address Badge */}
            <div className="flex items-start gap-2 text-xs text-stone-300 bg-stone-900/80 border border-stone-800 rounded-xl p-2.5 mb-6 max-w-md">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">{RESTAURANT_INFO.address}</span>
                <span className="text-stone-400 text-[11px]">{RESTAURANT_INFO.timing}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <button
                type="button"
                onClick={handleScrollToMenu}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-red-950/40 transition-all active:scale-95 cursor-pointer border border-amber-500/30"
              >
                <span>Order Online</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <a
                href={`tel:${RESTAURANT_INFO.phoneClean}`}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call: {RESTAURANT_INFO.phone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Dish Imagery with Logo Badge Overlay */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="relative w-64 sm:w-80 md:w-92 aspect-square">
              {/* Soft ambient golden halo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/25 via-red-600/20 to-transparent rounded-full filter blur-2xl transform scale-105" />

              {/* High-res Hero Dish */}
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80"
                alt="Authentic Dum Biryani"
                className="w-full h-full object-cover object-center rounded-full drop-shadow-2xl border-4 border-amber-500/40 shadow-2xl hover:scale-103 transition-transform duration-500"
                loading="eager"
              />

              {/* Official 3D Circular Logo Floating Badge */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-amber-400 shadow-2xl bg-stone-900 group hover:rotate-6 transition-transform duration-300">
                <img
                  src={RESTAURANT_INFO.logo}
                  alt="NFC 3D Official Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Bottom Flavor Badge */}
              <div className="absolute bottom-2 left-2 bg-stone-950/90 backdrop-blur-md border border-amber-500/40 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>100% Halal • Charcoal Grilled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile carousel indicator dots */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map((dot) => (
            <button
              key={dot}
              type="button"
              onClick={() => setActiveSlide(dot)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === dot
                  ? 'w-6 bg-amber-500'
                  : 'w-2 bg-stone-600 hover:bg-stone-500'
              }`}
              aria-label={`Slide ${dot + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
