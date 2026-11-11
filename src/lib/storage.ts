import { Participant, RegistrationFormData, EmailLog, CampaignConfig, DashboardStats, WebhookEvent } from '../types/giveaway';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_PARTICIPANTS = 'babybites_giveaway_participants_v1';
const STORAGE_KEY_EMAIL_LOGS = 'babybites_giveaway_email_logs_v1';
const STORAGE_KEY_CONFIG = 'babybites_giveaway_config_v1';
const STORAGE_KEY_SEQ = 'babybites_lucky_seq_v1';
const STORAGE_KEY_WEBHOOK_EVENTS = 'babybites_webhook_events_v1';

export const DEFAULT_CONFIG: CampaignConfig = {
  adminEmail: 'moianito2007@gmail.com',
  resendApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  webhookUrl: '',
  closingDate: '2026-11-20T23:59:59Z',
  launchDate: '2026-11-30T00:00:00Z',
  maxWinners: 5,
  isRegistrationOpen: true,
};

// Webhook events logging and retrieval for external dashboard
export function getStoredWebhookEvents(): WebhookEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WEBHOOK_EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordWebhookEvent(event: WebhookEvent): void {
  const list = getStoredWebhookEvents();
  list.unshift(event);
  localStorage.setItem(STORAGE_KEY_WEBHOOK_EVENTS, JSON.stringify(list.slice(0, 100)));
}

// Dispatches real-time webhook whenever any participant registers
export async function dispatchGiveawayWebhook(
  participant: Participant,
  cumulativeList: Participant[]
): Promise<WebhookEvent> {
  const config = getCampaignConfig();
  const webhookUrl = config.webhookUrl || (import.meta as any).env?.VITE_WEBHOOK_URL || '';

  const chronologicalList = [...cumulativeList].sort(
    (a, b) => new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime()
  );

  const eventPayload: WebhookEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
    event: 'giveaway.participant.registered',
    timestamp: new Date().toISOString(),
    participant: {
      id: participant.id,
      lucky_number: participant.lucky_number,
      full_name: participant.full_name,
      email: participant.email,
      baby_age: participant.baby_age,
      country: participant.country,
      feeding_challenge: participant.feeding_challenge,
      registered_at: participant.registered_at,
      registration_status: participant.registration_status,
    },
    cumulative: {
      total_participants: chronologicalList.length,
      latest_number: participant.lucky_number,
      all_lucky_numbers: chronologicalList
        .filter(p => p.registration_status === 'valid')
        .map(p => p.lucky_number),
    },
    target_url: webhookUrl || undefined,
  };

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-BabyBites-Event': 'giveaway.participant.registered',
        },
        body: JSON.stringify(eventPayload),
      });

      eventPayload.status = res.ok ? 'delivered' : 'failed';
      eventPayload.response_status = res.status;
    } catch (e) {
      eventPayload.status = 'failed';
      console.warn('Webhook dispatch failed:', e);
    }
  } else {
    // Recorded for internal realtime dashboard receiver
    eventPayload.status = 'simulated';
  }

  recordWebhookEvent(eventPayload);
  return eventPayload;
}

// Get current config
export function getCampaignConfig(): CampaignConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveCampaignConfig(config: Partial<CampaignConfig>): CampaignConfig {
  const current = getCampaignConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  return updated;
}

// Local participants management (synced with Supabase when available)
export function getLocalParticipants(): Participant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalParticipants(participants: Participant[]): void {
  localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
}

export function getLocalEmailLogs(): EmailLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAIL_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addEmailLog(log: Omit<EmailLog, 'id' | 'created_at'>): EmailLog {
  const logs = getLocalEmailLogs();
  const newLog: EmailLog = {
    id: 'log-' + Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString(),
    ...log,
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(logs));
  return newLog;
}

// Atomic lucky number generation (sequential BB0001, BB0002, ...)
export function generateNextLuckyNumber(existingParticipants: Participant[]): string {
  let highest = 0;
  for (const p of existingParticipants) {
    if (p.lucky_number && p.lucky_number.startsWith('BB')) {
      const numPart = parseInt(p.lucky_number.replace('BB', ''), 10);
      if (!isNaN(numPart) && numPart > highest) {
        highest = numPart;
      }
    }
  }

  const storedSeq = parseInt(localStorage.getItem(STORAGE_KEY_SEQ) || '0', 10);
  const nextVal = Math.max(highest, storedSeq) + 1;
  localStorage.setItem(STORAGE_KEY_SEQ, nextVal.toString());

  return `BB${nextVal.toString().padStart(4, '0')}`;
}

// Normalize email for duplicate prevention
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Send Resend notification emails (both Admin and Participant)
// CRITICAL: Administrator receives the CUMULATIVE MASTER LIST updated on every single registration!
export async function dispatchGiveawayEmails(
  participant: Participant,
  cumulativeList?: Participant[]
): Promise<{ adminSent: boolean; participantSent: boolean; error?: string }> {
  const config = getCampaignConfig();
  const apiKey = config.resendApiKey || (import.meta as any).env?.VITE_RESEND_API_KEY || '';

  // Get current complete list of participants sorted chronologically
  const fullList = cumulativeList && cumulativeList.length > 0 
    ? cumulativeList 
    : getLocalParticipants();
  
  // Sort from first registered to latest (1, 2, 3...)
  const chronologicalList = [...fullList].sort(
    (a, b) => new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime()
  );

  const totalRegistered = chronologicalList.length;

  const regDateFormatted = new Date(participant.registered_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }) + ' UTC';

  // Build the numbered cumulative list text:
  // 1. BB0001 - Name | email | baby's age | country | date
  const cumulativeTextList = chronologicalList
    .map((p, index) => {
      const num = index + 1;
      const countryStr = p.country ? ` | ${p.country}` : '';
      const challengeStr = p.feeding_challenge ? ` | Challenge: ${p.feeding_challenge}` : '';
      const statusStr = p.registration_status !== 'valid' ? ` [${p.registration_status.toUpperCase()}]` : '';
      return `${num}. [${p.lucky_number}] ${p.full_name} (${p.email}) - Baby: ${p.baby_age}${countryStr}${challengeStr}${statusStr}`;
    })
    .join('\n');

  // Lucky numbers list only (for fast draw import)
  const luckyNumbersBlock = chronologicalList
    .filter(p => p.registration_status === 'valid')
    .map(p => p.lucky_number)
    .join('\n');

  // Complete Raw CSV Content embedded directly in the email for instant copy-paste into Excel
  const csvHeaders = 'Lucky Number,Full Name,Email,Baby Age,Country,Registration Date,Feeding Challenge';
  const csvRows = chronologicalList
    .map(p => `"${p.lucky_number}","${p.full_name}","${p.email}","${p.baby_age}","${p.country || ''}","${p.registered_at.split('T')[0]}","${p.feeding_challenge || ''}"`)
    .join('\n');
  const rawCsvContent = `${csvHeaders}\n${csvRows}`;

  // Full Admin Email Body with the CUMULATIVE LIST + INSTANT CSV
  const adminSubject = `[BabyBites] Candidate #${totalRegistered}: ${participant.full_name} (${participant.lucky_number}) — Cumulative Master List Updated`;

  const adminBody = `===============================================================
BABYBITES EARLY ACCESS GIVEAWAY — CUMULATIVE MASTER UPDATE
===============================================================

LATEST REGISTRATION (#${totalRegistered}):
Name: ${participant.full_name}
Email: ${participant.email}
Lucky Number: ${participant.lucky_number}
Baby’s Age: ${participant.baby_age}
Country: ${participant.country || 'Not specified'}
Feeding Challenge: ${participant.feeding_challenge || 'None reported'}
Registration Date: ${regDateFormatted}

===============================================================
CUMULATIVE PARTICIPANT MASTER LIST (${totalRegistered} REGISTERED SO FAR):
===============================================================
${cumulativeTextList}

===============================================================
RAW CSV EXPORT DATA (COPY & PASTE INTO EXCEL / GOOGLE SHEETS):
===============================================================
${rawCsvContent}

===============================================================
LUCKY NUMBERS ONLY (COPY-PASTE READY FOR RANDOM.ORG DRAW):
===============================================================
${luckyNumbersBlock}

===============================================================
Direct Export Link: http://localhost:5173/admin-giveaway/export
Total Valid Entries for External Draw: ${chronologicalList.filter(p => p.registration_status === 'valid').length}
===============================================================`;

  // HTML formatted cumulative table for mobile email readability
  const adminHtmlRows = chronologicalList
    .map((p, index) => `
      <tr style="border-bottom: 1px solid #EFE8E2; font-size: 13px; font-family: 'Times New Roman', serif;">
        <td style="padding: 10px 8px; font-weight: bold; color: #8F3D52;">#${index + 1}</td>
        <td style="padding: 10px 8px; font-family: monospace; font-weight: bold; color: #2C2422;">${p.lucky_number}</td>
        <td style="padding: 10px 8px; font-weight: bold; color: #2C2422;">${p.full_name}</td>
        <td style="padding: 10px 8px; color: #5A4E4B;">${p.email}</td>
        <td style="padding: 10px 8px; color: #5A4E4B;">${p.baby_age}</td>
        <td style="padding: 10px 8px; color: #5A4E4B;">${p.country || '—'}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #887B78;">${new Date(p.registered_at).toLocaleDateString()}</td>
      </tr>
    `).join('');

  const adminHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: 'Times New Roman', Times, serif; background-color: #FAF7F2; padding: 20px; color: #2C2422; margin: 0;">
    <div style="max-width: 700px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8DFD5; border-radius: 12px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
      
      <div style="border-bottom: 2px solid #8F3D52; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="font-size: 24px; color: #8F3D52; margin: 0; font-family: 'Times New Roman', serif;">BabyBites Giveaway — Master Participant Update</h1>
        <p style="margin: 6px 0 0 0; color: #6E615D; font-size: 14px;">Total registered participants to date: <strong>${totalRegistered}</strong></p>
      </div>

      <!-- Quick Export Action Banner -->
      <div style="background-color: #F8F5EE; border: 1px solid #E6DDD0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #2C2422;">Export Options Directly from this Email:</p>
        <a href="http://localhost:5173/admin-giveaway/export" style="background-color: #8F3D52; color: #FFFFFF; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block;">
          📥 Download CSV / Excel on Device
        </a>
      </div>

      <div style="background-color: #FDF9F9; border: 1px solid #EEDCE2; border-radius: 8px; padding: 18px; margin-bottom: 26px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #8F3D52; text-transform: uppercase; letter-spacing: 1px;">New Candidate Just Registered (#${totalRegistered})</h3>
        <table style="width: 100%; font-size: 14px; font-family: 'Times New Roman', serif;">
          <tr><td style="width: 140px; color: #6E615D; padding: 4px 0;"><strong>Name:</strong></td><td style="font-weight: bold; color: #2C2422;">${participant.full_name}</td></tr>
          <tr><td style="color: #6E615D; padding: 4px 0;"><strong>Email:</strong></td><td>${participant.email}</td></tr>
          <tr><td style="color: #6E615D; padding: 4px 0;"><strong>Lucky Number:</strong></td><td style="font-size: 18px; font-family: monospace; font-weight: bold; color: #8F3D52;">${participant.lucky_number}</td></tr>
          <tr><td style="color: #6E615D; padding: 4px 0;"><strong>Baby's Age:</strong></td><td>${participant.baby_age}</td></tr>
          <tr><td style="color: #6E615D; padding: 4px 0;"><strong>Country:</strong></td><td>${participant.country || 'Not specified'}</td></tr>
          <tr><td style="color: #6E615D; padding: 4px 0;"><strong>Feeding Challenge:</strong></td><td>${participant.feeding_challenge || 'None'}</td></tr>
          <tr><td style="color: #6E615D; padding: 4px 0;"><strong>Registration Date:</strong></td><td>${regDateFormatted}</td></tr>
        </table>
      </div>

      <h3 style="font-size: 18px; color: #2C2422; margin: 0 0 12px 0;">Cumulative Participant List (${totalRegistered} Total)</h3>
      <p style="font-size: 13px; color: #6E615D; margin-top: 0;">This list grows continuously with every registration:</p>
      
      <div style="overflow-x: auto; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #FAF5F2; border-bottom: 2px solid #E8DFD5; font-size: 12px; color: #6E615D; text-transform: uppercase;">
              <th style="padding: 8px;">#</th>
              <th style="padding: 8px;">Code</th>
              <th style="padding: 8px;">Name</th>
              <th style="padding: 8px;">Email</th>
              <th style="padding: 8px;">Age</th>
              <th style="padding: 8px;">Country</th>
              <th style="padding: 8px;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${adminHtmlRows}
          </tbody>
        </table>
      </div>

      <!-- Instant CSV Copy Block right in email -->
      <div style="background-color: #FAF5F2; border: 1px solid #E8DFD5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #2C2422;">📋 Instant CSV Data (Copy &amp; Paste directly into Excel / Google Sheets):</h4>
        <p style="font-size: 12px; color: #6E615D; margin: 0 0 8px 0;">Select all text in this box, copy, and paste into Excel to export instantly:</p>
        <pre style="background: #FFFFFF; border: 1px solid #DDD6CB; padding: 10px; font-family: monospace; font-size: 11px; color: #2C2422; max-height: 140px; overflow-y: auto; margin: 0; white-space: pre-wrap;">${rawCsvContent}</pre>
      </div>

      <!-- Lucky Numbers Only -->
      <div style="background-color: #F7F5F0; border: 1px solid #E5DFD4; border-radius: 8px; padding: 16px; margin-top: 20px;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #2C2422;">🎲 Lucky Numbers Only (Ready for Random.org Draw):</h4>
        <pre style="background: #FFFFFF; border: 1px solid #DDD6CB; padding: 10px; font-family: monospace; font-size: 12px; color: #8F3D52; max-height: 120px; overflow-y: auto; margin: 0;">${luckyNumbersBlock}</pre>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #EFE8E2; font-size: 12px; color: #887B78; text-align: center;">
        BabyBites Giveaway Notifications &bull; Admin: ${config.adminEmail}
      </div>
    </div>
  </body>
  </html>
  `;

  console.log('Sending Cumulative Admin Notification to:', config.adminEmail);
  console.log(adminBody);

  // If Supabase edge function exists and supabase is configured, trigger it
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('send-giveaway-emails', {
        body: {
          participant,
          adminEmail: config.adminEmail,
          resendApiKey: apiKey || undefined,
          cumulativeCount: totalRegistered,
          cumulativeText: cumulativeTextList,
          luckyNumbersBlock,
        },
      });

      if (!error && data?.success) {
        addEmailLog({
          participant_id: participant.id,
          recipient_email: config.adminEmail,
          email_type: 'admin_notification',
          status: 'sent',
          attempts: 1,
        });
        addEmailLog({
          participant_id: participant.id,
          recipient_email: participant.email,
          email_type: 'participant_confirmation',
          status: 'sent',
          attempts: 1,
        });
        return { adminSent: true, participantSent: true };
      }
    } catch (edgeErr) {
      console.warn('Edge function invoke error, falling back to direct API or local logging:', edgeErr);
    }
  }

  // Direct Resend API call if API key is provided
  if (apiKey) {
    let adminOk = false;
    let participantOk = false;

    try {
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'BabyBites Giveaway <onboarding@resend.dev>',
          to: [config.adminEmail],
          subject: adminSubject,
          text: adminBody,
          html: adminHtml,
        }),
      });

      if (adminRes.ok) {
        adminOk = true;
        addEmailLog({
          participant_id: participant.id,
          recipient_email: config.adminEmail,
          email_type: 'admin_notification',
          status: 'sent',
          attempts: 1,
        });
      } else {
        const errText = await adminRes.text();
        addEmailLog({
          participant_id: participant.id,
          recipient_email: config.adminEmail,
          email_type: 'admin_notification',
          status: 'failed',
          error_message: errText,
          attempts: 1,
        });
      }
    } catch (err: any) {
      addEmailLog({
        participant_id: participant.id,
        recipient_email: config.adminEmail,
        email_type: 'admin_notification',
        status: 'failed',
        error_message: err?.message || 'Network error',
        attempts: 1,
      });
    }

    try {
      const pRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'BabyBites Giveaway <onboarding@resend.dev>',
          to: [participant.email],
          subject: `You're officially entered, mama! 💗 Your Lucky Number: ${participant.lucky_number}`,
          text: `Hi ${participant.full_name}!\n\nYou're officially entered into the BabyBites Early Access Giveaway.\n\nYour lucky number is: ${participant.lucky_number}\n\nImportant Dates:\n- Registration Closes: November 20, 2026\n- Official Launch: November 30, 2026\n\nGood luck! 💗\nBabyBites Team`,
        }),
      });

      if (pRes.ok) {
        participantOk = true;
        addEmailLog({
          participant_id: participant.id,
          recipient_email: participant.email,
          email_type: 'participant_confirmation',
          status: 'sent',
          attempts: 1,
        });
      } else {
        const errText = await pRes.text();
        addEmailLog({
          participant_id: participant.id,
          recipient_email: participant.email,
          email_type: 'participant_confirmation',
          status: 'failed',
          error_message: errText,
          attempts: 1,
        });
      }
    } catch (err: any) {
      addEmailLog({
        participant_id: participant.id,
        recipient_email: participant.email,
        email_type: 'participant_confirmation',
        status: 'failed',
        error_message: err?.message || 'Network error',
        attempts: 1,
      });
    }

    return { adminSent: adminOk, participantSent: participantOk };
  }

  // If no Resend API key is configured yet, record audit log in pending/ready state so it is retriable from Admin
  addEmailLog({
    participant_id: participant.id,
    recipient_email: config.adminEmail,
    email_type: 'admin_notification',
    status: 'pending',
    error_message: `Queued with full cumulative list (${totalRegistered} participants). Configure RESEND_API_KEY to send immediately.`,
    attempts: 0,
  });

  addEmailLog({
    participant_id: participant.id,
    recipient_email: participant.email,
    email_type: 'participant_confirmation',
    status: 'pending',
    error_message: 'Waiting for RESEND_API_KEY in Admin Settings. Payload is queued and logged.',
    attempts: 0,
  });

  return { adminSent: false, participantSent: false };
}

// Primary registration function
export async function registerParticipant(data: RegistrationFormData): Promise<{ success: boolean; participant?: Participant; error?: string }> {
  // Anti-spam honeypot check
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { success: false, error: 'Spam detected.' };
  }

  // Validate required inputs
  if (!data.fullName || data.fullName.trim().length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!data.babyAge || data.babyAge.trim().length === 0) {
    return { success: false, error: "Please select your baby's age." };
  }

  if (!data.consentGiven) {
    return { success: false, error: 'You must agree to the Giveaway Rules and consent to data processing.' };
  }

  const normalized = normalizeEmail(data.email);

  // If Supabase is configured, attempt backend atomic registration first
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: result, error } = await supabase.rpc('register_giveaway_participant', {
        p_full_name: data.fullName.trim(),
        p_email: data.email.trim(),
        p_baby_age: data.babyAge,
        p_country: data.country?.trim() || null,
        p_feeding_challenge: data.feedingChallenge?.trim() || null,
        p_consent_given: true,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (result) {
        const participant: Participant = result as Participant;
        // Also sync to local cache
        const localList = getLocalParticipants();
        if (!localList.some(p => p.id === participant.id)) {
          localList.unshift(participant);
          saveLocalParticipants(localList);
        }

        // Trigger emails with cumulative list
        dispatchGiveawayEmails(participant, localList);
        dispatchGiveawayWebhook(participant, localList);
        return { success: true, participant };
      }
    } catch (rpcErr: any) {
      console.warn('Supabase RPC call failed, falling back to local database storage:', rpcErr);
    }
  }

  // Local storage handling (enforcing uniqueness and atomic lucky number)
  const existing = getLocalParticipants();
  const isDuplicate = existing.some(p => p.normalized_email === normalized);
  if (isDuplicate) {
    return {
      success: false,
      error: 'This email address is already entered in the BabyBites Giveaway! Each mother may register once.',
    };
  }

  const luckyNumber = generateNextLuckyNumber(existing);
  const now = new Date().toISOString();

  const newParticipant: Participant = {
    id: 'bb-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
    full_name: data.fullName.trim(),
    email: data.email.trim(),
    normalized_email: normalized,
    baby_age: data.babyAge,
    country: data.country?.trim() || undefined,
    feeding_challenge: data.feedingChallenge?.trim() || undefined,
    lucky_number: luckyNumber,
    registration_status: 'valid',
    email_verified: true,
    consent_given: true,
    registered_at: now,
    updated_at: now,
  };

  existing.unshift(newParticipant);
  saveLocalParticipants(existing);

  // Dispatch emails with complete cumulative list!
  dispatchGiveawayEmails(newParticipant, existing);

  // Dispatch real-time webhook event!
  dispatchGiveawayWebhook(newParticipant, existing);

  return { success: true, participant: newParticipant };
}

// Fetch all participants (from Supabase if configured, or local)
export async function fetchAllParticipants(): Promise<Participant[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('registered_at', { ascending: false });

      if (!error && data) {
        saveLocalParticipants(data as Participant[]);
        return data as Participant[];
      }
    } catch (e) {
      console.warn('Error fetching from Supabase, using local participants:', e);
    }
  }
  return getLocalParticipants();
}

// Disqualify participant (with recorded reason)
// Rule: NEVER allow administrators to silently modify lucky numbers.
export async function disqualifyParticipant(participantId: string, reason: string): Promise<boolean> {
  const participants = getLocalParticipants();
  const index = participants.findIndex(p => p.id === participantId);
  if (index === -1) return false;

  participants[index].registration_status = 'disqualified';
  participants[index].disqualification_reason = reason;
  participants[index].updated_at = new Date().toISOString();
  saveLocalParticipants(participants);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('participants')
        .update({
          registration_status: 'disqualified',
          disqualification_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    } catch (e) {
      console.warn('Error updating Supabase disqualification:', e);
    }
  }

  return true;
}

// Mark participant as valid again (reinstate)
export async function reinstateParticipant(participantId: string): Promise<boolean> {
  const participants = getLocalParticipants();
  const index = participants.findIndex(p => p.id === participantId);
  if (index === -1) return false;

  participants[index].registration_status = 'valid';
  participants[index].disqualification_reason = undefined;
  participants[index].updated_at = new Date().toISOString();
  saveLocalParticipants(participants);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('participants')
        .update({
          registration_status: 'valid',
          disqualification_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    } catch (e) {
      console.warn('Error reinstating in Supabase:', e);
    }
  }

  return true;
}

// Compute dashboard statistics
export function calculateDashboardStats(participants: Participant[]): DashboardStats {
  const totalRegistrations = participants.length;
  let verifiedEmails = 0;
  let pendingEmailVerification = 0;
  let validRegistrations = 0;
  let disqualifiedRegistrations = 0;
  const registrationsByCountry: Record<string, number> = {};
  const registrationsByBabyAge: Record<string, number> = {};

  for (const p of participants) {
    if (p.email_verified) verifiedEmails++;
    else pendingEmailVerification++;

    if (p.registration_status === 'valid') validRegistrations++;
    else if (p.registration_status === 'disqualified') disqualifiedRegistrations++;

    const country = p.country?.trim() || 'Unspecified';
    registrationsByCountry[country] = (registrationsByCountry[country] || 0) + 1;

    const age = p.baby_age || 'Unknown';
    registrationsByBabyAge[age] = (registrationsByBabyAge[age] || 0) + 1;
  }

  return {
    totalRegistrations,
    verifiedEmails,
    pendingEmailVerification,
    validRegistrations,
    disqualifiedRegistrations,
    registrationsByCountry,
    registrationsByBabyAge,
    latestRegistrations: participants.slice(0, 10),
  };
}
