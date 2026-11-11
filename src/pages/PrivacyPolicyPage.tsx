import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Heart, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF9] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/early-access"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Giveaway Registration</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-soft border border-rose-100 space-y-8">
          <div className="border-b border-rose-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Legal &amp; Data Protection
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif tracking-tight mt-3">
              BabyBites Privacy Policy &amp; Participant Consent
            </h1>
            <p className="text-xs text-stone-500 mt-2">
              Last updated: November 2026 &bull; Effective for BabyBites Early Access Giveaway
            </p>
          </div>

          <div className="prose prose-stone text-stone-600 text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                1. Introduction &amp; Commitment
              </h2>
              <p>
                At BabyBites (“we,” “our,” or “us”), we understand that mothers and families entrust us with important personal information. We are strictly committed to safeguarding your privacy and treating all participant data with the utmost security, confidentiality, and respect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                2. Information We Collect
              </h2>
              <p>
                When you voluntarily register for the BabyBites Early Access Giveaway, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Full Name:</strong> To address you personally and verify entry identity.</li>
                <li><strong>Email Address:</strong> To deliver your unique sequential lucky number, send critical giveaway notifications, and alert winners.</li>
                <li><strong>Baby’s Age / Stage:</strong> To tailor age-appropriate baby nutrition meal plans and early access guidance.</li>
                <li><strong>Country (Optional):</strong> To understand geographic distribution and timezone considerations.</li>
                <li><strong>Feeding Challenge (Optional):</strong> To address specific parental concerns (e.g., picky eating, allergen safety, purees vs. BLW).</li>
                <li><strong>Sequential Lucky Number:</strong> Automatically generated and permanently assigned to your profile for entry verification.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                3. Purpose of Processing &amp; Legal Basis
              </h2>
              <p>
                We process your personal information exclusively for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Administering and executing the Early Access Giveaway;</li>
                <li>Assigning unique sequential lucky numbers (BB0001, BB0002, etc.);</li>
                <li>Notifying the campaign administrator (<code className="text-rose-600">moianito2007@gmail.com</code>) of each valid submission;</li>
                <li>Exporting participant lucky numbers for external verified third-party random drawing;</li>
                <li>Contacting the 5 chosen mothers on or before November 30, 2026 to grant complimentary 7-day VIP access;</li>
                <li>Sending product launch announcements relating to BabyBites.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                4. Data Security &amp; Confidentiality
              </h2>
              <p>
                All participant information is stored in secure database infrastructure with Row Level Security (RLS) enabled. Public visitors cannot query or download participant records. Backend operations are conducted over encrypted HTTPS/TLS connections.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                5. Third-Party Services
              </h2>
              <p>
                We use <strong>Resend</strong> for transactional email delivery and <strong>Supabase</strong> for cloud data storage. We do not sell, rent, or trade your personal data to advertisers or unrelated third parties under any circumstance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                6. Your Rights
              </h2>
              <p>
                You retain the right to access, update, or request the deletion of your participant profile at any time prior to the drawing by emailing <a href="mailto:moianito2007@gmail.com" className="text-rose-600 underline font-semibold">moianito2007@gmail.com</a>.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-rose-100 flex items-center justify-between">
            <span className="text-xs text-stone-400">BabyBites Inc. &bull; Wholesome Baby Nutrition</span>
            <Link
              to="/early-access"
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Return to Registration &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
