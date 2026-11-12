import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, CheckCircle2, AlertCircle, Loader2, Baby, Mail, User, Phone, ShieldAlert, Globe, HelpCircle, Search, ChevronDown } from 'lucide-react';
import { registerParticipant } from '../lib/storage';
import { RegistrationFormData } from '../types/giveaway';
import { COUNTRY_DIAL_CODES, CountryDialCode } from '../data/countryDialCodes';

const BABY_AGE_OPTIONS = [
  '6-8 months',
  '9-12 months',
  '12-24 months',
  '24+ months',
];

const FEEDING_CHALLENGES = [
  'Picky eating / refusing new textures',
  'Worry about food allergies & safe introduction',
  'Confusion between Baby-Led Weaning vs Purees',
  'Not knowing balanced daily meal portions',
  'Lack of time to cook baby-safe meals',
  'Other / General guidance',
];

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    babyAge: '',
    country: '',
    feedingChallenge: '',
    consentGiven: false,
    honeypot: '',
  });

  const [selectedCountry, setSelectedCountry] = useState<CountryDialCode | null>(null);
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_DIAL_CODES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch) ||
    c.iso.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name, mama.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address so we can deliver your lucky number.');
      return;
    }

    if (!selectedCountry) {
      setErrorMessage('Please select your country dial code from the list.');
      return;
    }

    if (!localPhoneNumber.trim() || localPhoneNumber.trim().length < 4) {
      setErrorMessage('Please enter your valid phone / WhatsApp number for VIP group verification.');
      return;
    }

    if (!formData.babyAge) {
      setErrorMessage("Please select your baby's age stage.");
      return;
    }

    if (!formData.consentGiven) {
      setErrorMessage('Please check the consent box to enter the giveaway.');
      return;
    }

    setIsLoading(true);

    const fullPhoneNumber = `${selectedCountry.code} ${localPhoneNumber.trim()}`;
    const submissionData: RegistrationFormData = {
      ...formData,
      phone: fullPhoneNumber,
      country: formData.country || selectedCountry.name,
    };

    try {
      const result = await registerParticipant(submissionData);

      if (!result.success || !result.participant) {
        setErrorMessage(result.error || 'Something went wrong. Please check your information and try again.');
        setIsLoading(false);
        return;
      }

      // Successful registration redirect
      navigate('/registration-success', {
        state: { participant: result.participant },
        replace: true,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      id="register-section"
      className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-[#E7DFD5] shadow-[0_16px_45px_rgba(27,67,50,0.06)] relative overflow-hidden"
    >
      {/* Decorative gradient top ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2D6A4F] via-[#F4A261] to-[#E76F51]" />

      {/* Header */}
      <div className="text-center mb-5 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#1B4332] bg-[#EBF7EE] border border-[#BDE0CE] mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>7 Days Free VIP Access Giveaway</span>
        </span>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1F1B18] tracking-tight">
          Claim Your Unique Lucky Number 💗
        </h3>

        <p className="text-xs text-[#6B5E55] mt-1 max-w-sm mx-auto leading-relaxed">
          12 lucky moms will win 7 days of full VIP access. Closes <strong>Nov 20</strong> • Announced <strong>Nov 21</strong>.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-[#FFF3F0] border border-[#FCD8C5] text-[#D55C3D] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Anti-spam Honeypot */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ROW 1: Full Name & Email Address (Organized 2-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D352E] mb-1">
              Full Name <span className="text-[#D94E34]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7E72]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Sarah Johnson"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-[#DCD3C7] text-[#1F1B18] text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all placeholder:text-[#A89E94]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D352E] mb-1">
              Email Address <span className="text-[#D94E34]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7E72]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-[#DCD3C7] text-[#1F1B18] text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all placeholder:text-[#A89E94]"
              />
            </div>
          </div>
        </div>

        {/* ROW 2: WhatsApp / Phone Number with Searchable Country Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D352E]">
              WhatsApp / Phone Number <span className="text-[#D94E34]">*</span>
            </label>
            <span className="text-[10px] text-[#8C7E72] font-medium hidden sm:inline">
              Select dial code &amp; enter number
            </span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <div className="flex h-11 rounded-xl bg-white border border-[#DCD3C7] focus-within:border-[#2D6A4F] focus-within:ring-2 focus-within:ring-[#2D6A4F]/15 transition-all overflow-hidden shadow-xs">
              {/* Country Code Trigger Button */}
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 h-full bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#1F1B18] text-xs font-semibold border-r border-[#DCD3C7] transition-colors shrink-0 cursor-pointer"
                title="Click to search country dial code"
              >
                {selectedCountry ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{selectedCountry.flag}</span>
                    <span className="font-mono text-xs font-bold text-[#1B4332]">{selectedCountry.code}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-[#7A7067]">
                    <span className="text-sm">🌐</span>
                    <span className="font-medium">Country Code</span>
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-[#8C7E72] transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Local Phone Number Input */}
              <input
                type="tel"
                required
                placeholder={selectedCountry ? `${selectedCountry.code} Phone number` : "Select country code then enter number"}
                value={localPhoneNumber}
                onChange={(e) => setLocalPhoneNumber(e.target.value)}
                className="flex-1 h-full px-3.5 bg-transparent text-[#1F1B18] text-xs sm:text-sm focus:outline-none placeholder:text-[#A89E94]"
              />
            </div>

            {/* Searchable Country Dropdown Popover */}
            {isCountryDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-[#DCD3C7] shadow-xl p-2 max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Search Filter Bar */}
                <div className="relative mb-1.5 shrink-0">
                  <Search className="w-3.5 h-3.5 text-[#8C7E72] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search country or code (Mozambique, Brazil, Portugal, US, +258)..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-[#FAF8F5] border border-[#DCD3C7] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-[#1F1B18]"
                  />
                </div>

                {/* Country List */}
                <div className="overflow-y-auto flex-1 space-y-0.5 divide-y divide-[#F7F4EE]">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <button
                        key={`${c.iso}-${c.code}`}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          if (!formData.country) {
                            setFormData(prev => ({ ...prev, country: c.name }));
                          }
                          setIsCountryDropdownOpen(false);
                          setCountrySearch('');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                          selectedCountry?.iso === c.iso
                            ? 'bg-[#EBF7EE] text-[#1B4332] font-bold'
                            : 'hover:bg-[#FAF8F5] text-[#1F1B18]'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-base">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="font-mono font-bold text-[#2D6A4F] shrink-0 ml-2">
                          {c.code}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-3 text-center text-xs text-[#8C7E72]">
                      No countries found matching "{countrySearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Compact VIP Verification Notice (Clean Amber Pill) */}
          <div className="mt-2 px-3 py-2 rounded-xl bg-[#FFFBF0] border border-[#FDE68A] flex items-center gap-2 text-xs text-[#92400E]">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <p className="text-[11px] leading-snug">
              <strong className="text-[#78350F]">VIP Verification Required:</strong> Phone numbers are cross-checked with our official VIP Mom Community. Non-VIP members are disqualified.
            </p>
          </div>
        </div>

        {/* ROW 3: Baby's Age Stage & Country (2-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {/* Baby's Age Stage (Mandatory - 4 exact age brackets) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D352E] mb-1">
              Baby’s Age Stage <span className="text-[#D94E34]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7E72]">
                <Baby className="w-4 h-4" />
              </div>
              <select
                name="babyAge"
                required
                value={formData.babyAge}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-8 rounded-xl bg-white border border-[#DCD3C7] text-[#1F1B18] text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all cursor-pointer appearance-none"
              >
                <option value="">Select baby's age...</option>
                {BABY_AGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8C7E72]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Country (Optional) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D352E] mb-1">
              Country <span className="text-[#8C7E72] font-normal normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7E72]">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="country"
                placeholder="e.g. Mozambique, Brazil, US"
                value={formData.country}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-[#DCD3C7] text-[#1F1B18] text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all placeholder:text-[#A89E94]"
              />
            </div>
          </div>
        </div>

        {/* ROW 4: Feeding Challenge (Optional) */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D352E] mb-1">
            Feeding Challenge <span className="text-[#8C7E72] font-normal normal-case">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7E72]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <select
              name="feedingChallenge"
              value={formData.feedingChallenge}
              onChange={handleChange}
              className="w-full h-11 pl-9 pr-8 rounded-xl bg-white border border-[#DCD3C7] text-[#1F1B18] text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all cursor-pointer appearance-none"
            >
              <option value="">Select a feeding challenge (optional)...</option>
              {FEEDING_CHALLENGES.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8C7E72]">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              name="consentGiven"
              required
              checked={formData.consentGiven}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-[#DCD3C7] text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
            />
            <span className="text-[11px] text-[#5D554E] leading-relaxed group-hover:text-[#1F1B18]">
              I agree to the{' '}
              <a href="/giveaway-rules" target="_blank" className="text-[#2D6A4F] font-bold underline hover:text-[#1B4332]">
                Giveaway Rules
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" target="_blank" className="text-[#2D6A4F] font-bold underline hover:text-[#1B4332]">
                Privacy Policy
              </a>
              . I consent to BabyBites assigning my lucky number and sending launch communications.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#1E4D38] hover:from-[#245640] hover:to-[#173B2B] text-white font-bold text-sm tracking-wide shadow-md shadow-[#2D6A4F33] hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning Your Lucky Number...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-current text-[#FCD8C5]" />
                <span>Enter Giveaway &amp; Get My Lucky Code</span>
              </>
            )}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 text-[#8C7E72] text-[11px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Instant Lucky Code
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Zero Spam Guarantee
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            VIP Verified Only
          </span>
        </div>
      </form>
    </div>
  );
};
