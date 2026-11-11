import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Copy, 
  Heart, 
  Sparkles, 
  Calendar, 
  Mail, 
  ArrowRight
} from 'lucide-react';
import { Participant } from '../types/giveaway';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const participant: Participant | undefined = location.state?.participant;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#2D6A4F', '#52B788', '#E76F51', '#F4A261', '#FAF7F2'],
      });
    } catch (e) {
      // Ignore fallback
    }
  }, []);

  const handleCopyCode = () => {
    if (!participant?.lucky_number) return;
    navigator.clipboard.writeText(participant.lucky_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const luckyCode = participant?.lucky_number || 'BB0001';

  return (
    <div className="min-h-screen bg-maternal-mesh py-10 sm:py-16 flex flex-col items-center justify-center px-4 font-sans text-[#2C2422]">
      <div className="max-w-md w-full bg-white/95 rounded-[32px] p-6 sm:p-9 border-2 border-[#E8DFD3] shadow-[0_20px_50px_rgba(45,106,79,0.1)] text-center relative overflow-hidden">
        
        {/* Soft gradient banner decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2D6A4F] via-[#F4A261] to-[#E76F51]" />

        {/* Heart Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border-2 border-[#C7E4D6] mx-auto flex items-center justify-center text-[#2D6A4F] mb-5 shadow-sm mt-2">
          <Heart className="w-8 h-8 fill-current text-[#2D6A4F]" />
        </div>

        {/* Required Headline in Times New Roman */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs uppercase tracking-wider font-bold text-[#1B4332] bg-[#E8F5E9] border border-[#C7E4D6] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Entry Confirmed</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1B1A] tracking-tight leading-tight">
            You’re officially entered, mama! 💗
          </h1>

          <p className="text-xs sm:text-sm text-[#5C524C] mt-2">
            {participant?.full_name ? (
              <>Thank you, <strong className="text-[#1F1B1A]">{participant.full_name}</strong>! Your entry is permanently secured.</>
            ) : (
              <>Your registration is complete and secured in the BabyBites Giveaway.</>
            )}
          </p>
        </div>

        {/* Lucky Number Display Box */}
        <div className="mt-6 p-6 rounded-2xl bg-[#F2F8F5] border-2 border-dashed border-[#2D6A4F]">
          <p className="text-xs uppercase tracking-wider font-bold text-[#1B4332] mb-1">
            Your lucky number is:
          </p>

          <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-[#2D6A4F] py-2">
            [{luckyCode}]
          </div>

          <p className="text-xs text-[#5D554E] mt-1">
            Keep this code safe! It will be used in our external random draw.
          </p>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleCopyCode}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                copied
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-white hover:bg-[#E5F4EC] text-[#24211D] border border-[#DFD6CB]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Code Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8A8077]" />
                  <span>Copy Lucky Number</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Participant Details Summary */}
        {participant && (
          <div className="mt-5 bg-[#FAF7F2] rounded-2xl p-4 text-left border border-[#EDE5DA] text-xs text-[#5D554E] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8A8077]">Email Address:</span>
              <span className="font-bold text-[#24211D]">{participant.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8077]">Baby's Stage:</span>
              <span className="font-bold text-[#24211D]">{participant.baby_age}</span>
            </div>
            {participant.country && (
              <div className="flex justify-between">
                <span className="text-[#8A8077]">Country:</span>
                <span className="font-bold text-[#24211D]">{participant.country}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#8A8077]">Registration Date:</span>
              <span className="font-bold text-[#24211D]">
                {new Date(participant.registered_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Email Notification Alert */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#FFF7F2] border border-[#FCD8C5] text-left text-xs text-[#5D554E] flex items-start gap-2.5">
          <Mail className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
          <p>
            A confirmation email has been dispatched to <strong>{participant?.email || 'your email'}</strong> with your entry details.
          </p>
        </div>

        {/* Dates Review */}
        <div className="mt-6 pt-4 border-t border-[#F2ECE3] text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#7A7067]">Registration Closes:</span>
            <span className="font-bold text-[#24211D]">Nov 20, 2026 (11:59 PM EST)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#7A7067]">External Verified Draw:</span>
            <span className="font-bold text-[#2D6A4F]">Nov 21–25, 2026</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#7A7067]">Official Launch &amp; VIP Access:</span>
            <span className="font-bold text-[#24211D]">Nov 30, 2026</span>
          </div>
        </div>

        {/* Return Button */}
        <div className="mt-6">
          <Link
            to="/early-access"
            className="w-full py-3 px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#E5F4EC] text-[#2D6A4F] font-bold text-xs block transition-colors border border-[#C7E4D6]"
          >
            Back to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
};
