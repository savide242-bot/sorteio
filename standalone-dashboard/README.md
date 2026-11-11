# BabyBites — Standalone Webhook Control Dashboard

This is the **autonomous, separate dashboard** for the BabyBites Early Access Giveaway.
It is decoupled from the public registration website and deployed independently.

---

## 📡 How It Works (Webhook Architecture)

1. The public giveaway website collects mother registrations and assigns unique lucky numbers (`BB0001`, `BB0002`...).
2. When an entry occurs, the website dispatches an HTTP POST Webhook event (`giveaway.participant.registered`).
3. This Dashboard listens to incoming webhooks and updates its cumulative master list in real time.
4. The administrator can download CSV, Excel-ready files, or a clean text file of lucky numbers for the **Random.org** external draw.

---

## 🚀 Running Locally

```bash
cd standalone-dashboard
npm install
npm run dev
```

The dashboard runs on: `http://localhost:5174`
Webhook Receiver Endpoint: `http://localhost:5174/api/webhook`

---

## 🌐 Deploying Separately (Vercel / Netlify / Render)

You can push this `standalone-dashboard` folder as its own separate GitHub repository or deploy it directly to Vercel/Netlify.
Once deployed, set `VITE_WEBHOOK_URL=https://your-dashboard-domain.com/api/webhook` in the public registration website.
