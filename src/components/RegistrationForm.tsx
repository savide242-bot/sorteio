import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, CheckCircle2, AlertCircle, Loader2, Baby, Mail, User, Phone, ShieldAlert, Globe, HelpCircle } from 'lucide-react';
import { registerParticipant } from '../lib/storage';
import { RegistrationFormData } from '../types/giveaway';

const BABY_AGE_OPTIONS = [
  'Expecting / Due Soon',
  '0 – 3 months (Newborn)',
  '4 – 6 months (Starting Solids)',
  '6 – 8 months (Exploring Purees & Textures)',
  '9 – 12 months (Finger Foods & Self-Feeding)',
  '12 – 18 months (Transition to Table Foods)',
  '18 – 24 months (Toddler Eating)',
  '2+ years old',
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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      setErrorMessage('O número de telefone é obrigatório para validação da sua vaga no Grupo VIP.');
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

    try {
      const result = await registerParticipant(formData);

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
      className="w-full bg-[#FFFFFF] rounded-[28px] p-6 sm:p-9 border-2 border-[#E8DFD3] shadow-[0_20px_50px_rgba(45,106,79,0.08)] relative overflow-hidden"
    >
      {/* Soft gradient banner decoration */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E76F51] via-[#F4A261] to-[#2D6A4F]" />

      {/* Decorative Header */}
      <div className="text-center mb-6 sm:mb-8 pt-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-[#C7E4D6] mb-3 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
          <span>7 Days Free VIP Access Giveaway</span>
        </span>

        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1B1A] tracking-tight">
          Claim Your Unique Lucky Number 💗
        </h3>

        <p className="text-xs sm:text-sm text-[#5C524C] mt-2 max-w-md mx-auto leading-relaxed">
          12 lucky moms will win complimentary 7-day VIP access to all 300+ recipes, weekly planners, and allergy tracking starting November 20! Winners announced November 21.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-[#FFF3F0] border border-[#FCD8C5] text-[#D55C3D] text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#E76F51] shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
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

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#474039] mb-1.5">
            Full Name <span className="text-[#E76F51]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8077]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Sarah Johnson"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-[#24211D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white transition-all placeholder:text-[#9A9086]"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#474039] mb-1.5">
            Email Address <span className="text-[#E76F51]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8077]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              required
              placeholder="sarah@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-[#24211D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white transition-all placeholder:text-[#9A9086]"
            />
          </div>
          <p className="text-[11px] text-[#7A7067] mt-1 pl-1">
            Your permanent lucky number (e.g. BB0001) will be delivered here instantly.
          </p>
        </div>

        {/* Phone Number (WhatsApp / Mobile) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#474039] mb-1.5">
            WhatsApp / Phone Number <span className="text-[#E76F51]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8077]">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+1 (555) 234-5678 / WhatsApp com DDD"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-[#24211D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white transition-all placeholder:text-[#9A9086]"
            />
          </div>

          {/* VIP Community Notice */}
          <div className="mt-2.5 p-3.5 rounded-2xl bg-[#FFF6F0] border-2 border-[#FBD3C1] text-[#8C2C13] text-xs flex items-start gap-2.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-[11px] block text-[#B23B1B] mb-0.5">
                ⚠️ Aviso Importante — Verificação do Grupo VIP
              </span>
              O número de telefone é obrigatório. A nossa equipe vai verificar cada número para confirmar se você está no <strong>Grupo VIP Oficial</strong>. Todas as mães que não estiverem no grupo serão desqualificadas do sorteio.
            </div>
          </div>
        </div>

        {/* Baby's Age */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#474039] mb-1.5">
            Baby’s Age Stage <span className="text-[#E76F51]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8077]">
              <Baby className="w-4 h-4" />
            </div>
            <select
              name="babyAge"
              required
              value={formData.babyAge}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-[#24211D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Select your baby's stage...</option>
              {BABY_AGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Country & Feeding Challenge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#474039] mb-1.5">
              Country <span className="text-[#9A9086] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8077]">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="country"
                placeholder="e.g. United States, UK"
                value={formData.country}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-[#24211D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white transition-all placeholder:text-[#9A9086]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#474039] mb-1.5">
              Feeding Challenge <span className="text-[#9A9086] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8077]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <select
                name="feedingChallenge"
                value={formData.feedingChallenge}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-[#24211D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white transition-all"
              >
                <option value="">Select a challenge...</option>
                {FEEDING_CHALLENGES.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mandatory Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="consentGiven"
              required
              checked={formData.consentGiven}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-[#E2D9CE] text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
            />
            <span className="text-xs text-[#5D554E] leading-relaxed group-hover:text-[#24211D]">
              I agree to the{' '}
              <a href="/giveaway-rules" target="_blank" className="text-[#2D6A4F] font-bold underline hover:text-[#1B4332]">
                Official Giveaway Rules
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" target="_blank" className="text-[#2D6A4F] font-bold underline hover:text-[#1B4332]">
                Privacy Policy
              </a>
              . I consent to BabyBites processing my information to assign my lucky number and send launch communications.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-[#2D6A4F] hover:bg-[#245640] text-white font-bold text-base shadow-lg shadow-[#2D6A4F33] hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Your Lucky Number...</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 fill-current text-[#FCD8C5]" />
                <span>Enter Giveaway &amp; Get My Lucky Code</span>
              </>
            )}
          </button>
        </div>

        {/* Trust Points */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[#7A7067] text-xs">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Zero Spam Guarantee
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Instant Sequential Code
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            No Purchase Necessary
          </span>
        </div>
      </form>
    </div>
  );
};
