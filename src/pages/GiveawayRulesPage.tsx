import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Calendar, CheckCircle2, ShieldCheck, Star } from 'lucide-react';

export const GiveawayRulesPage: React.FC = () => {
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
              Official Campaign Terms
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif tracking-tight mt-3">
              Official Rules: BabyBites Early Access Giveaway
            </h1>
            <p className="text-xs text-stone-500 mt-2">
              NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE DOES NOT INCREASE YOUR CHANCES OF WINNING.
            </p>
          </div>

          <div className="prose prose-stone text-stone-600 text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                1. Campaign Sponsor
              </h2>
              <p>
                The BabyBites Early Access Giveaway is sponsored and administered by BabyBites Inc. (“Sponsor”). For questions or inquiries, contact <a href="mailto:moianito2007@gmail.com" className="text-rose-600 font-semibold underline">moianito2007@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                2. Eligibility
              </h2>
              <p>
                The Giveaway is open to mothers, expectant parents, and primary caregivers aged 18 or older. Void where prohibited by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                3. Entry Period &amp; Deadlines
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Registration Closes:</strong> November 20, 2026 at 11:59 PM Eastern Time (EST). All entries must be received prior to this deadline.</li>
                <li><strong>External Selection Period:</strong> November 21–25, 2026.</li>
                <li><strong>Official Launch Date &amp; Access Begins:</strong> November 30, 2026.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                4. How to Enter &amp; Lucky Number Assignment
              </h2>
              <p>
                Visit <Link to="/early-access" className="text-rose-600 underline font-semibold">/early-access</Link> and complete the registration form with your Full Name, Email Address, and Baby’s Age. Upon submission:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Each participant automatically receives a unique sequential lucky number (format: BB0001, BB0002, etc.).</li>
                <li>Lucky numbers are assigned atomically by the database and permanently bound to the entrant.</li>
                <li><strong>Limit:</strong> Exactly one (1) entry per person/email address. Duplicate entries are blocked using normalized email validation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                5. External Random Draw Procedure (Zero On-Site Bias)
              </h2>
              <p>
                In the interest of complete transparency and auditing:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>No Internal Draw Button:</strong> This website does not execute any winner selection algorithms or random draws internally.</li>
                <li>Following the November 20 deadline, the administrator exports the complete list of eligible sequential lucky numbers.</li>
                <li>The draw is conducted using an independent certified random number generation platform (such as Random.org).</li>
                <li>Exactly twelve (12) winning numbers will be selected at random from among all eligible entries.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                6. Prizes &amp; Value
              </h2>
              <p>
                Twelve (12) Winners will each receive:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Seven (7) full consecutive days of complimentary VIP Early Access to the entire BabyBites platform ahead of the public launch;</li>
                <li>Personalized stage-based weaning and first-foods meal plans;</li>
                <li>Direct onboarding guidance and priority feedback channel.</li>
              </ul>
              <p className="mt-2 text-xs text-stone-500">
                Prizes have no cash surrender value and are non-transferable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">
                7. Winner Notification &amp; Verification
              </h2>
              <p>
                Winners will be notified via the email address supplied during registration. Winners will have 48 hours to confirm acceptance. If a selected participant is disqualified or fails to respond, an alternate number will be selected from the audited pool.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-rose-100 flex items-center justify-between">
            <span className="text-xs text-stone-400">BabyBites Official Giveaway Terms &bull; 2026</span>
            <Link
              to="/early-access"
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Enter Giveaway Now &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
