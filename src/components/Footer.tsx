import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#182C22] text-[#D8E6DE] pt-14 pb-10 border-t border-[#234032] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#234032]">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="/babybites-logo.png" 
                alt="BabyBites Logo" 
                className="w-10 h-10 rounded-full object-contain bg-white p-0.5 border border-[#52B788]/40 shadow-sm" 
              />
              <span className="text-2xl font-bold tracking-tight text-white font-serif">
                Baby<span className="text-[#52B788]">Bites</span>
              </span>
            </div>
            <p className="text-[#A7C2B4] text-xs sm:text-sm max-w-sm leading-relaxed">
              Wholesome, pediatrician-approved baby nutrition plans, first-foods guidance, and weaning simplicity designed for mothers everywhere.
            </p>
            <div className="text-xs text-[#52B788] pt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Early Access Giveaway &bull; Launching November 30, 2026</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-serif">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#A7C2B4]">
              <li>
                <Link to="/early-access" className="hover:text-white transition-colors">
                  Early Access Registration
                </Link>
              </li>
              <li>
                <a href="/early-access#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/early-access#features" className="hover:text-white transition-colors">
                  App Features (300+ Recipes)
                </a>
              </li>
              <li>
                <Link to="/giveaway-rules" className="hover:text-white transition-colors">
                  Official Giveaway Rules
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy &amp; Consent
                </Link>
              </li>
            </ul>
          </div>

          {/* Draw Policy & Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-serif">
              Draw Policy &amp; Management
            </h4>
            <ul className="space-y-2 text-xs text-[#A7C2B4]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#52B788] mt-0.5 shrink-0" />
                <span>External verified random draw on Nov 21–25, 2026.</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#52B788] mt-0.5 shrink-0" />
                <span>Entries close Nov 20, 2026 at 11:59 PM EST.</span>
              </li>
              <li className="pt-2 text-xs text-[#7B9E8B]">
                Real-time automated webhook &amp; email delivery enabled.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7B9E8B] gap-3">
          <p>&copy; 2026 BabyBites Inc. All rights reserved.</p>
          <p>No purchase necessary. 12 winners selected via external verified random draw.</p>
        </div>
      </div>
    </footer>
  );
};
