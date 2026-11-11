import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Mail, 
  Key, 
  Database, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw,
  Copy,
  Check,
  Shield,
  FileCode
} from 'lucide-react';
import { 
  getCampaignConfig, 
  saveCampaignConfig, 
  getLocalEmailLogs, 
  DEFAULT_CONFIG 
} from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { CampaignConfig, EmailLog } from '../../types/giveaway';

export const AdminSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<CampaignConfig>(DEFAULT_CONFIG);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  useEffect(() => {
    setConfig(getCampaignConfig());
    setEmailLogs(getLocalEmailLogs());
    const pass = localStorage.getItem('babybites_admin_pass') || 'babybites2026';
    setAdminPassword(pass);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig((prev) => ({ ...prev, [name]: checked }));
    } else {
      setConfig((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCampaignConfig(config);
    if (adminPassword.trim()) {
      localStorage.setItem('babybites_admin_pass', adminPassword.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Trigger test email to admin
  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestEmailStatus(null);

    const apiKey = config.resendApiKey || (import.meta as any).env?.VITE_RESEND_API_KEY;
    if (!apiKey) {
      setTestEmailStatus('Error: Please enter a valid RESEND_API_KEY first.');
      setIsSendingTest(false);
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'BabyBites Giveaway <onboarding@resend.dev>',
          to: [config.adminEmail],
          subject: 'Test: BabyBites Giveaway Integration',
          text: `Integration test successful! Admin notification channel is verified for: ${config.adminEmail}`,
        }),
      });

      if (response.ok) {
        setTestEmailStatus(`Test email successfully dispatched to ${config.adminEmail}!`);
      } else {
        const errorText = await response.text();
        setTestEmailStatus(`Failed to send test email: ${errorText}`);
      }
    } catch (err: any) {
      setTestEmailStatus(`Network error: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Supabase SQL Schema for BabyBites Giveaway
CREATE SEQUENCE IF NOT EXISTS lucky_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_lucky_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE next_val BIGINT;
BEGIN
  next_val := nextval('lucky_number_seq');
  RETURN 'BB' || lpad(next_val::TEXT, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL UNIQUE,
  baby_age TEXT NOT NULL,
  country TEXT,
  feeding_challenge TEXT,
  lucky_number TEXT NOT NULL UNIQUE,
  registration_status TEXT NOT NULL DEFAULT 'valid',
  email_verified BOOLEAN NOT NULL DEFAULT true,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  disqualification_reason TEXT
);`;
    navigator.clipboard.writeText(sql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft">
        <h1 className="text-2xl font-bold font-serif text-stone-900">
          Campaign Settings &amp; Infrastructure
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure notification dispatch, Resend API key, Supabase endpoints, and campaign deadlines.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Email & Resend Settings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-soft space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-rose-100">
            <Mail className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-serif text-stone-900">
              Resend Email Integration Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Notification Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Administrator Notification Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="adminEmail"
                required
                value={config.adminEmail}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Every successful registration immediately dispatches an alert to this address.
              </p>
            </div>

            {/* Resend API Key */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Resend API Key (<code className="text-rose-500">RESEND_API_KEY</code>)
              </label>
              <input
                type="password"
                name="resendApiKey"
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                value={config.resendApiKey}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Required for live email delivery via Resend.
              </p>
            </div>
          </div>

          {/* Test email button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Sending Test...' : 'Send Test Email to Admin'}</span>
            </button>

            {testEmailStatus && (
              <span className={`text-xs ${testEmailStatus.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600 font-medium'}`}>
                {testEmailStatus}
              </span>
            )}
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold font-serif text-stone-900">
                Supabase Backend Configuration
              </h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                name="supabaseUrl"
                placeholder="https://your-project.supabase.co"
                value={config.supabaseUrl}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                name="supabaseAnonKey"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                value={config.supabaseAnonKey}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={copySqlSchema}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            >
              {copiedSchema ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SQL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy SQL Schema for Supabase SQL Editor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Campaign Deadlines & Password */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-soft space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-rose-100">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold font-serif text-stone-900">
              Giveaway Deadlines &amp; Security Passkey
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Registration Closing Date
              </label>
              <input
                type="text"
                name="closingDate"
                value={config.closingDate}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-mono"
              />
              <p className="text-[10px] text-stone-400 mt-1">Default: 2026-11-20T23:59:59Z</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Official Launch Date
              </label>
              <input
                type="text"
                name="launchDate"
                value={config.launchDate}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-mono"
              />
              <p className="text-[10px] text-stone-400 mt-1">Default: 2026-11-30T00:00:00Z</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Admin Gateway Passkey
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-mono"
              />
              <p className="text-[10px] text-stone-400 mt-1">Protects /admin-giveaway portal</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-3 px-8 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Campaign Configurations</span>
          </button>
        </div>
      </form>

      {/* Email Delivery Audit Logs Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Email Delivery Audit Logs
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              History of all admin notifications and participant confirmation email events
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEmailLogs(getLocalEmailLogs())}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-600 uppercase tracking-wider font-semibold border-b border-rose-100">
              <tr>
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Attempts</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-stone-700">
              {emailLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-rose-50/20">
                  <td className="py-2.5 px-4 font-medium text-stone-900">
                    {log.recipient_email}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="capitalize">{log.email_type.replace('_', ' ')}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">{log.attempts}</td>
                  <td className="py-2.5 px-4 text-stone-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-stone-500 max-w-xs truncate">
                    {log.error_message || 'OK'}
                  </td>
                </tr>
              ))}

              {emailLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                    No email events logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
