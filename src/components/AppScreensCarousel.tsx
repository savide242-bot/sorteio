import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  badge: string;
  headline: string;
  persuasiveCopy: string;
  highlightPill: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/app-screens/screen1-recipes.jpg',
    badge: '300+ Pediatrician Recipes',
    headline: 'No More Wondering "What Should I Feed My Baby?"',
    persuasiveCopy: 'Nutritious, easy meals for 6 to 24+ months made in under 20 minutes. Delicious purees, BLW finger foods, and hidden veggie nuggets your baby actually eats.',
    highlightPill: 'Saves 45 mins of daily meal prep',
  },
  {
    id: 2,
    image: '/app-screens/screen2-planner.jpg',
    badge: 'Stress-Free Meal Planner',
    headline: 'End Mealtime Panic Before It Starts',
    persuasiveCopy: 'Your baby’s breakfast, lunch, dinner, and snack mapped out day by day. One glance tells you what to cook, what is prepared, and what comes next.',
    highlightPill: 'Zero mental overload for mom',
  },
  {
    id: 3,
    image: '/app-screens/screen3-grocery.jpg',
    badge: 'Smart 1-Tap Grocery List',
    headline: 'Stop Throwing Food & Money in the Trash',
    persuasiveCopy: 'Your planned meals instantly organize an automated checklist categorized by produce and pantry staples. Shop with speed and never buy duplicate ingredients.',
    highlightPill: 'Save on weekly grocery waste',
  },
  {
    id: 4,
    image: '/app-screens/screen4-community.jpg',
    badge: 'Real Mom Inspiration Feed',
    headline: 'Real Plates from Real Moms — You’re Never Alone',
    persuasiveCopy: 'See photos of what mothers just like you are serving their babies right now. Discover creative food pairings, positive milestones, and picky-eater breakthroughs.',
    highlightPill: 'Daily calm, supportive community',
  },
  {
    id: 5,
    image: '/app-screens/screen5-pantry.jpg',
    badge: 'Instant Pantry Matcher',
    headline: 'Got Just Oats & a Banana? Healthy Dinner Is Done',
    persuasiveCopy: 'Type the 2 or 3 ingredients sitting on your counter right now. BabyBites instantly reveals pediatrician-approved recipes you can make without going to the store.',
    highlightPill: 'Cook with what you already have',
  },
];

export const AppScreensCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const current = SLIDES[currentIndex];

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl p-5 sm:p-7 border border-[#EFE9DF] shadow-app">
      {/* Top Header Pill */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F4EFEA]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] font-sans">
            Inside The BabyBites App
          </span>
        </div>
        <span className="text-xs font-bold text-[#8A8077] font-sans">
          {currentIndex + 1} / {SLIDES.length}
        </span>
      </div>

      {/* Main Carousel Display with Left / Right Floating Arrow Buttons */}
      <div className="relative group max-w-sm mx-auto mb-5">
        {/* Device Container Frame */}
        <div className="relative rounded-[28px] overflow-hidden border-[6px] border-[#24211D] bg-[#24211D] shadow-2xl aspect-[9/18] max-h-[460px] mx-auto flex items-center justify-center">
          <img
            src={current.image}
            alt={current.headline}
            className="w-full h-full object-cover object-top transition-opacity duration-300"
          />

          {/* Floating Next / Previous Buttons on the sides */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Feature Slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#24211D]/80 hover:bg-[#2D6A4F] text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Feature Slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#24211D]/80 hover:bg-[#2D6A4F] text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 -mr-0.5" />
          </button>
        </div>

        {/* Thumbnail indicators */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-8 bg-[#2D6A4F]'
                  : 'w-2 bg-[#E2D9CE] hover:bg-[#B8AC9E]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Direct Persuasive Description for the Current Slide */}
      <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#EDE5DA] text-left">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#1B4332] bg-[#E5F4EC] border border-[#C7E4D6]">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{current.badge}</span>
          </span>
          <span className="text-[11px] font-semibold text-[#2D6A4F]">
            {current.highlightPill}
          </span>
        </div>

        <h4 className="text-base sm:text-lg font-bold font-serif text-[#24211D] leading-snug mb-1.5">
          {current.headline}
        </h4>

        <p className="text-xs sm:text-sm text-[#5D554E] font-sans leading-relaxed">
          {current.persuasiveCopy}
        </p>

        {/* Quick next slide hint */}
        <div className="mt-3 pt-3 border-t border-[#E8DFD3] flex items-center justify-between text-xs font-sans text-[#8A8077]">
          <span>Tap arrows to explore all 5 features</span>
          <button
            type="button"
            onClick={nextSlide}
            className="font-bold text-[#2D6A4F] hover:underline inline-flex items-center gap-1"
          >
            <span>Next preview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
