import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

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
    <section className="relative w-full overflow-hidden bg-[#121316] text-white pt-8 pb-14 sm:py-16 md:py-20">
      {/* Background radial ambient warmth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="md:col-span-7 flex flex-col items-start justify-center">
            {/* Authentic Taste cursive script tag */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="font-script text-2xl sm:text-3xl text-amber-400 font-bold tracking-wide transform -rotate-2 inline-block">
                Authentic Taste
              </span>
              <svg
                className="w-8 h-6 text-amber-400/80 -mt-2 hidden sm:inline-block"
                viewBox="0 0 40 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 18 C 15 24, 25 15, 36 6 M 30 5 L 37 6 L 35 13" />
              </svg>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1] mb-3 sm:mb-4">
              Good Food <br />
              Brings People <br />
              <span className="text-amber-500">Together</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-300 font-normal max-w-md leading-relaxed mb-6 sm:mb-8">
              Delicious food, great ambiance, unforgettable moments.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <button
                onClick={handleScrollToMenu}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-orange-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={handleScrollToMenu}
                className="px-6 sm:px-7 py-3 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 font-medium text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                View Menu
              </button>
            </div>
          </div>

          {/* Right Column: Hero Dish Imagery */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="relative w-64 sm:w-80 md:w-96 aspect-square">
              {/* Soft glow circle behind dish */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-transparent rounded-full filter blur-xl transform scale-105" />

              {/* High-res Hero Dish (Chicken Biryani in traditional brass bowl) */}
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80"
                alt="Authentic Dum Biryani"
                className="w-full h-full object-cover object-center rounded-full drop-shadow-2xl border-4 border-amber-500/20 shadow-2xl hover:scale-103 transition-transform duration-500"
                loading="eager"
              />

              {/* Floating Mini Flavor badge */}
              <div className="absolute bottom-2 left-2 bg-stone-900/90 backdrop-blur-md border border-amber-500/30 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Slow Cooked Dum Biryani</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile carousel indicator dots (matching the mockup) */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map((dot) => (
            <button
              key={dot}
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
