import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Gift, 
  ShieldCheck, 
  Utensils, 
  ChevronDown, 
  Check, 
  Award, 
  Apple, 
  Smile, 
  BookOpen, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { RegistrationForm } from '../components/RegistrationForm';
import { AppScreensCarousel } from '../components/AppScreensCarousel';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How are the 12 lucky winners chosen?',
      a: 'Transparency is our top priority. After registration closes on November 20, 2026 at 11:59 PM EST, all eligible lucky numbers are exported directly into an external verified drawing application (Random.org). 12 unique winning numbers will be drawn and contacted directly via email.'
    },
    {
      q: 'Does it cost anything to register or participate?',
      a: 'No! Registration is 100% free with no purchase necessary. If selected, you receive full complimentary VIP access to the complete BabyBites app for 7 full days with zero credit card required.'
    },
    {
      q: 'What is included in the 7-day early access prize?',
      a: 'The 12 winning moms will enjoy complete unlimited access to BabyBites 7 days prior to our official public launch on November 30, 2026. This includes all 300+ baby recipes, stage-by-stage meal plans, allergen tracking, pantry matcher tool, and automatic grocery list generator.'
    },
    {
      q: 'When will I receive my lucky number?',
      a: 'Immediately upon completing the registration form! You will see your official sequential number (e.g., BB0001) right on your screen, and a confirmation email will be delivered to your inbox.'
    },
    {
      q: 'Can I register more than once to increase my chances?',
      a: 'To keep the giveaway strictly fair for every mama, only one registration per participant/email is permitted. Duplicate entries are automatically prevented.'
    },
    {
      q: 'What if my baby has not started solids yet?',
      a: 'You are completely welcome! BabyBites offers customized prep guides and milestone timelines for expectant mothers and newborns starting from 0 to 6 months so you are prepared.'
    }
  ];

  return (
    <div className="min-h-screen bg-maternal-mesh text-[#2C2422] overflow-x-hidden selection:bg-[#E8F5E9] selection:text-[#1B4332]">
      {/* Top Warm Announcement Bar */}
      <div className="bg-[#1B4332] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide shadow-sm">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#A7E9AF]">
          <Sparkles className="w-3.5 h-3.5" />
          BabyBites VIP Early Access:
        </span>{' '}
        Registration closes on <span className="underline font-bold text-white">November 20, 2026</span> &bull; Official Launch on <span className="underline font-bold text-white">November 30, 2026</span>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Typography with Times New Roman & Maternal Elegance */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#E3D8CC] text-[#1B4332] text-xs sm:text-sm font-bold uppercase tracking-wider mb-5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span>12 Lucky Moms &bull; 7 Days Free VIP Access</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#1F1B1A] tracking-tight leading-[1.15] mb-5">
              Be One of Our <br className="hidden sm:inline" />
              <span className="text-[#2D6A4F] italic underline decoration-[#C7E4D6] decoration-wavy decoration-1">
                12 Early Access Moms!
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#5C524C] leading-relaxed max-w-2xl mx-auto font-normal">
              We’re giving 12 lucky moms the opportunity to experience <strong className="text-[#1F1B1A] font-bold">BabyBites for 7 days, completely free</strong>, before our official launch on November 30.
            </p>
          </div>

          {/* 3 Core Highlights (Mobile friendly cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/95 border border-[#EAE1D6] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center shrink-0 font-serif font-bold text-xl border border-[#C7E4D6]">
                12
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1B1A] font-serif">12 Lucky Moms</h4>
                <p className="text-xs text-[#756A63]">Selected via external random draw</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/95 border border-[#EAE1D6] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] text-[#E76F51] flex items-center justify-center shrink-0 font-serif font-bold text-xl border border-[#FCD8C5]">
                7
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1B1A] font-serif">7 Days Free Access</h4>
                <p className="text-xs text-[#756A63]">Full VIP access, no card needed</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/95 border border-[#EAE1D6] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF5FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#D0E2FF]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1B1A] font-serif">Exclusive Early Access</h4>
                <p className="text-xs text-[#756A63]">Test before our official launch</p>
              </div>
            </div>
          </div>

          {/* Countdown & Dates Box */}
          <div className="max-w-xl mx-auto mb-12 sm:mb-16 p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-sm border border-[#EAE1D6] shadow-md text-center">
            <CountdownTimer targetDate="2026-11-20T23:59:59Z" />

            <div className="mt-5 pt-4 border-t border-[#F2ECE3] grid grid-cols-2 gap-4 text-xs font-serif">
              <div>
                <span className="text-[#8A8077] block font-sans uppercase tracking-wider text-[10px]">Registration Closes</span>
                <span className="font-bold text-[#1F1B1A] text-sm">November 20, 2026</span>
              </div>
              <div className="border-l border-[#F2ECE3]">
                <span className="text-[#8A8077] block font-sans uppercase tracking-wider text-[10px]">Official Launch Date</span>
                <span className="font-bold text-[#2D6A4F] text-sm">November 30, 2026</span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT: Interactive App Carousel & Registration Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
            
            {/* Left: Real App Screens Carousel (Phone mockup with lateral arrows) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <AppScreensCarousel />
            </div>

            {/* Right: Registration Form */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <RegistrationForm />
            </div>

          </div>

        </div>
      </section>

      {/* "How It Works" Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-[#EFE9DF] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#E5F4EC] px-3.5 py-1.5 rounded-full border border-[#C7E4D6]">
              Simple &bull; Transparent &bull; Fair
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#24211D] tracking-tight mt-3">
              How the Early Access Giveaway Works
            </h2>
            <p className="text-[#5D554E] text-sm sm:text-base mt-2">
              4 simple steps from registration to experiencing BabyBites for free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#EDE5DA] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif font-bold text-[#2D6A4F] block mb-2">01</span>
                <h3 className="text-base font-bold text-[#24211D] mb-2 font-serif">Claim Your Code</h3>
                <p className="text-xs text-[#5D554E] leading-relaxed">
                  Enter your details in under 60 seconds. Our database instantly generates your permanent sequential lucky number (e.g. BB0001).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EAE2D8] text-[11px] font-bold text-[#2D6A4F]">
                Instant Lucky Number
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#EDE5DA] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif font-bold text-[#E76F51] block mb-2">02</span>
                <h3 className="text-base font-bold text-[#24211D] mb-2 font-serif">Entries Close</h3>
                <p className="text-xs text-[#5D554E] leading-relaxed">
                  Registration officially locks on <strong>November 20, 2026 at 11:59 PM EST</strong>. All unique participant codes are finalized.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EAE2D8] text-[11px] font-bold text-[#7A7067]">
                Deadline: Nov 20, 2026
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#EDE5DA] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif font-bold text-[#2563EB] block mb-2">03</span>
                <h3 className="text-base font-bold text-[#24211D] mb-2 font-serif">External Draw</h3>
                <p className="text-xs text-[#5D554E] leading-relaxed">
                  All eligible numbers are exported into an independent verified draw software (Random.org). 12 winning mothers are chosen.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EAE2D8] text-[11px] font-bold text-[#2563EB]">
                External Random Draw
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#EDE5DA] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif font-bold text-[#2D6A4F] block mb-2">04</span>
                <h3 className="text-base font-bold text-[#24211D] mb-2 font-serif">7 Days Free VIP</h3>
                <p className="text-xs text-[#5D554E] leading-relaxed">
                  Starting <strong>November 30, 2026</strong>, the 12 winners receive free 7-day VIP access to all BabyBites recipes and meal plans!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EAE2D8] text-[11px] font-bold text-[#2D6A4F]">
                Official Launch: Nov 30, 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BabyBites Features Presentation */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FCFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#E5F4EC] px-3.5 py-1.5 rounded-full border border-[#C7E4D6]">
              Built for Real Mothers
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#24211D] tracking-tight mt-3">
              Calm, Confident &amp; Nourishing Mealtimes
            </h2>
            <p className="text-[#5D554E] text-sm sm:text-base mt-2">
              Everything you need to feed your baby with peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9DF] shadow-clean">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F4EC] text-[#2D6A4F] flex items-center justify-center mb-5">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-2">300+ Stage-by-Stage Recipes</h3>
              <p className="text-xs sm:text-sm text-[#5D554E] leading-relaxed">
                Whether you prefer Baby-Led Weaning (BLW) or smooth purees, enjoy quick recipes matched to your baby's exact oral-motor stage.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#EFE9DF] shadow-clean">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF3F0] text-[#E76F51] flex items-center justify-center mb-5">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-2">First 100 Foods Tracker</h3>
              <p className="text-xs sm:text-sm text-[#5D554E] leading-relaxed">
                Track every fruit, vegetable, allergen, and protein with a visual milestone diary. Celebrate food variety with zero stress.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#EFE9DF] shadow-clean">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F4EC] text-[#2D6A4F] flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-2">Allergen Safety Protocol</h3>
              <p className="text-xs sm:text-sm text-[#5D554E] leading-relaxed">
                Step-by-step guidance on safely introducing the top 9 allergens in tiny micro-doses under pediatrician supervision.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#EFE9DF] shadow-clean">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF3F0] text-[#E76F51] flex items-center justify-center mb-5">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-2">15-Minute Family Meals</h3>
              <p className="text-xs sm:text-sm text-[#5D554E] leading-relaxed">
                Never cook two separate dinners! Get wholesome recipes that can be easily modified for baby while feeding the family delicious real food.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#EFE9DF] shadow-clean">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F4EC] text-[#2D6A4F] flex items-center justify-center mb-5">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-2">Picky Eater Solutions</h3>
              <p className="text-xs sm:text-sm text-[#5D554E] leading-relaxed">
                Backed by occupational therapists: sensory food play and gentle texture bridges that turn mealtime tears into curious bites.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#EFE9DF] shadow-clean">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] text-[#2563EB] flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-2">Choking Safety Cuts</h3>
              <p className="text-xs sm:text-sm text-[#5D554E] leading-relaxed">
                Quick-reference visual guides on cutting sizes (bananas, blueberries, avocados) to safely prevent choking risks at every age.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-t border-[#EFE9DF] px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#E5F4EC] px-3.5 py-1.5 rounded-full border border-[#C7E4D6]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#24211D] tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#EFE9DF] bg-[#FAF7F2] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#24211D]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#2D6A4F] shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#5D554E] leading-relaxed border-t border-[#EDE5DA]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 text-center p-6 sm:p-8 rounded-3xl bg-[#E5F4EC] border border-[#C7E4D6]">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1B4332] mb-2">
              Ready to Win 7 Days of Free VIP Access?
            </h3>
            <p className="text-xs sm:text-sm text-[#2D6A4F] max-w-md mx-auto mb-5">
              Registration is 100% free with no purchase necessary. Claim your lucky number now.
            </p>
            <a
              href="#register-section"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-[#2D6A4F] hover:bg-[#245640] text-white shadow-lg shadow-[#2D6A4F33] transition-all"
            >
              <Heart className="w-4 h-4 fill-current text-[#FCD8C5]" />
              <span>Claim My Free Lucky Number</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
