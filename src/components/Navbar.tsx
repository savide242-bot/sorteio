import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Shield, Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin-giveaway');

  const navLinks = [
    { label: 'Early Access', href: '/early-access' },
    { label: 'How It Works', href: '/early-access#how-it-works' },
    { label: 'App Features', href: '/early-access#features' },
    { label: 'FAQ', href: '/early-access#faq' },
    { label: 'Rules', href: '/giveaway-rules' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FCFAF7]/95 backdrop-blur-md border-b border-[#EFEAE2] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo matching the app screenshot */}
          <Link to="/early-access" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#E5F4EC] border border-[#C7E4D6] flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
              <span>🥣</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#24211D]">
                  Baby<span className="text-[#2D6A4F]">Bites</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E5F4EC] text-[#1B4332] border border-[#C7E4D6]">
                  GIVEAWAY
                </span>
              </div>
              <p className="text-[11px] text-[#7A7067] -mt-0.5 font-sans font-medium">
                Nourished with Love &bull; 300+ Baby Meals
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#5D554E]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#2D6A4F] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/early-access#register-section"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2D6A4F] hover:bg-[#245640] text-white shadow-md shadow-[#2D6A4F22] hover:shadow-lg transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-[#FCD8C5]" />
              <span>Enter Giveaway</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="/early-access#register-section"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#2D6A4F] text-white shadow-sm"
            >
              Enter
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#5D554E] hover:bg-[#EFEAE2]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFAF7] border-b border-[#EFEAE2] px-4 pt-3 pb-6 space-y-3 font-sans">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-semibold text-[#24211D] border-b border-[#F4EFEA] hover:text-[#2D6A4F]"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-2">
            <a
              href="/early-access#register-section"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-[#FCD8C5]" />
              <span>Claim Free Lucky Number</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
