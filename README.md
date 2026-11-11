# BabyBites — Early Access Giveaway Registration Website

A complete, production-grade registration platform built for the **BabyBites Early Access Giveaway**.

> **IMPORTANT ARCHITECTURAL NOTICE:**
> This website **DOES NOT** perform random winner selection or draws. Its sole purpose is collecting participant information, atomically assigning unique sequential lucky numbers (`BB0001`, `BB0002`...), sending email notifications via Resend, and providing administrators with audited data export tools for external drawing software (e.g. Random.org).

---

## 🌸 Key Features

1. **Brand & Design:**
   - Palette: Soft pink (`#FDF2F4`, `#FCE7EB`), warm cream (`#FDFCF9`, `#FAF7F0`), white, and beige.
   - Natural American English copywriting crafted with warmth and maternal care.
   - Live Countdown Timer targeting Registration Close (**November 20, 2026**).
   - Official Launch Date (**November 30, 2026**).

2. **Public Registration Experience (`/early-access`):**
   - High-converting hero with headline *"Be One of Our 5 Early Access Moms!"*
   - Clear value highlights: **5 Lucky Moms**, **7 Days Free Access**, **Exclusive Early Access**.
   - Input fields: Full Name, Email Address, Baby's Age, Country (optional), Feeding Challenge (optional).
   - Normalized email validation (`sarah@email.com` == `SARAH@EMAIL.COM`) to block duplicate registrations.
   - Anti-spam honeypot protection.
   - Mandatory consent checkbox for data protection and giveaway rules.

3. **Confirmation Page (`/registration-success`):**
   - Confetti celebration animation.
   - Prominent badge displaying:
     > *"You’re officially entered, mama! 💗"*  
     > *"Your lucky number is: [BB0001]"*
   - One-click copy button with instant visual confirmation.
   - Important milestone dates review.

4. **Resend Email Integration & Edge Functions:**
   - **Admin Notification:** Dispatched immediately upon every successful entry to `moianito2007@gmail.com`:
     ```text
     NEW CANDIDATE

     Name: [Full Name]
     Email: [Participant Email]
     Lucky Number: [Unique Code]
     Baby’s Age: [Baby’s Age]
     Country: [Country, if available]
     Registration Date: [Date and Time]
     ```
   - **Participant Confirmation:** Rich HTML & plain-text email with their permanent lucky number.
   - Supabase Edge Function provided at `supabase/functions/send-giveaway-emails/index.ts`.
   - Audit logging table (`email_logs`) tracking delivery attempts.

5. **Private Administrator Dashboard (`/admin-giveaway`):**
   - Secure Admin Passkey authentication (Default passkey: `babybites2026`).
   - Statistics: Total registrations, Verified emails, Pending verification, Count by country, Count by baby's age.
   - Participant management table with search, multi-criteria filtering, participant files, and one-click resend confirmation email.
   - Disqualification workflow with required reason recording (Lucky numbers are permanent and immutable).

6. **Dedicated External Draw Preparation (`/admin-giveaway/export`):**
   - Transparent count of eligible and total participants.
   - **Download CSV File:** `Lucky Number, Full Name, Email, Baby's Age, Country, Registration Date`.
   - **Download Excel-Compatible File:** Pre-formatted with UTF-8 BOM.
   - **Download Lucky Numbers TXT:** Plain list containing solely lucky numbers (one per line) ready for copy-pasting directly into certified external drawing software.

---

## 🚀 Routes

| Route | Purpose |
| :--- | :--- |
| `/` or `/early-access` | Public giveaway landing & registration page |
| `/registration-success` | Participant confirmation & lucky number display |
| `/admin-giveaway` | Private admin KPI dashboard |
| `/admin-giveaway/participants` | Search, filter, view details & disqualify participants |
| `/admin-giveaway/export` | Dedicated "EXPORT PARTICIPANTS" external draw center |
| `/admin-giveaway/settings` | Campaign configuration, email test & schema viewer |
| `/privacy-policy` | Official data privacy & participant consent policy |
| `/giveaway-rules` | Official sweepstakes terms & external draw protocol |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Router:** React Router v6
- **Database & Auth:** Supabase (PostgreSQL with RLS, atomic sequence, RPC)
- **Email Delivery:** Resend API & Supabase Edge Functions

---

## 🔐 Admin Access

- **Portal URL:** `/admin-giveaway`
- **Default Passkey:** `babybites2026` (Customizable inside Settings)
- **Admin Email:** `moianito2007@gmail.com`
