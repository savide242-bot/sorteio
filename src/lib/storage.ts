import { Participant, RegistrationFormData, EmailLog, CampaignConfig, DashboardStats, WebhookEvent } from '../types/giveaway';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_PARTICIPANTS = 'babybites_giveaway_participants_v1';
const STORAGE_KEY_EMAIL_LOGS = 'babybites_giveaway_email_logs_v1';
const STORAGE_KEY_CONFIG = 'babybites_giveaway_config_v1';
const STORAGE_KEY_SEQ = 'babybites_lucky_seq_v1';
const STORAGE_KEY_WEBHOOK_EVENTS = 'babybites_webhook_events_v1';

export const DEFAULT_CONFIG: CampaignConfig = {
  adminEmail: (import.meta as any).env?.VITE_ADMIN_EMAIL || 'octaviomoiane2007@gmail.com',
  resendApiKey: (import.meta as any).env?.VITE_RESEND_API_KEY || '',
  supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
  supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  webhookUrl: (import.meta as any).env?.VITE_WEBHOOK_URL || 'http://localhost:5174/api/webhook',
  closingDate: '2026-11-20T23:59:59Z',
  launchDate: '2026-11-20T23:59:59Z',
  maxWinners: 12,
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
      phone: participant.phone,
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
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      resendApiKey: parsed.resendApiKey || DEFAULT_CONFIG.resendApiKey,
      adminEmail: parsed.adminEmail || DEFAULT_CONFIG.adminEmail,
    };
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
  // 1. BB0001 - Name | Phone | email | baby's age | country | date
  const cumulativeTextList = chronologicalList
    .map((p, index) => {
      const num = index + 1;
      const phoneStr = p.phone ? ` | Phone: ${p.phone}` : '';
      const countryStr = p.country ? ` | ${p.country}` : '';
      const challengeStr = p.feeding_challenge ? ` | Challenge: ${p.feeding_challenge}` : '';
      const statusStr = p.registration_status !== 'valid' ? ` [${p.registration_status.toUpperCase()}]` : '';
      return `${num}. [${p.lucky_number}] ${p.full_name}${phoneStr} (${p.email}) - Baby: ${p.baby_age}${countryStr}${challengeStr}${statusStr}`;
    })
    .join('\n');

  // Lucky numbers list only (for fast draw import)
  const luckyNumbersBlock = chronologicalList
    .filter(p => p.registration_status === 'valid')
    .map(p => p.lucky_number)
    .join('\n');

  // Complete Raw CSV Content embedded directly in the email for instant copy-paste into Excel
  const csvHeaders = 'Lucky Number,Full Name,Phone,Email,Baby Age,Country,Registration Date,Feeding Challenge';
  const csvRows = chronologicalList
    .map(p => `"${p.lucky_number}","${p.full_name}","${p.phone || ''}","${p.email}","${p.baby_age}","${p.country || ''}","${p.registered_at.split('T')[0]}","${p.feeding_challenge || ''}"`)
    .join('\n');
  const rawCsvContent = `${csvHeaders}\n${csvRows}`;

  // Full Admin Email Body with the CUMULATIVE LIST + INSTANT CSV
  const adminSubject = `[BabyBites] Nova Inscrição #${totalRegistered}: ${participant.full_name} (${participant.lucky_number}) — Lista Mestre Atualizada`;

  const adminBody = `===============================================================
BABYBITES EARLY ACCESS GIVEAWAY — CUMULATIVE MASTER UPDATE
===============================================================

NOVO CANDIDATO (#${totalRegistered}):
Nome: ${participant.full_name}
Telefone / WhatsApp: ${participant.phone || 'Não informado'}
Email: ${participant.email}
Número da Sorte: ${participant.lucky_number}
Idade do Bebé: ${participant.baby_age}
País: ${participant.country || 'Não especificado'}
Desafio Alimentar: ${participant.feeding_challenge || 'Nenhum relatado'}
Data de Registro: ${regDateFormatted}

===============================================================
LISTA CUMULATIVA DE PARTICIPANTES (${totalRegistered} REGISTRADOS ATÉ AGORA):
===============================================================
${cumulativeTextList}

===============================================================
DADOS CSV EM BRUTO (COPIAR E COLAR DIRETO NO EXCEL / SHEETS):
===============================================================
${rawCsvContent}

===============================================================
APENAS OS NÚMEROS DA SORTE (PRONTOS PARA O RANDOM.ORG):
===============================================================
${luckyNumbersBlock}

===============================================================
Total de Participantes Válidos para o Sorteio: ${chronologicalList.filter(p => p.registration_status === 'valid').length}
Encerramento: 20 de Novembro de 2026 | Anúncio dos Vencedores: 21 de Novembro de 2026
===============================================================`;

  // HTML formatted cumulative table for mobile email readability
  const adminHtmlRows = chronologicalList
    .map((p, index) => `
      <tr style="border-bottom: 1px solid #EDE4DA; font-size: 13px; font-family: 'Times New Roman', serif; background-color: ${index % 2 === 0 ? '#FFFFFF' : '#FAF7F3'};">
        <td style="padding: 10px 8px; font-weight: bold; color: #2D6A4F;">#${index + 1}</td>
        <td style="padding: 10px 8px; font-family: monospace; font-weight: bold; color: #1F1B1A; font-size: 14px;">${p.lucky_number}</td>
        <td style="padding: 10px 8px; font-weight: bold; color: #1F1B1A;">${p.full_name}</td>
        <td style="padding: 10px 8px; font-family: monospace; font-weight: bold; color: #8C2C13;">${p.phone || '—'}</td>
        <td style="padding: 10px 8px; color: #5C524C;">${p.email}</td>
        <td style="padding: 10px 8px; color: #5C524C;">${p.baby_age}</td>
        <td style="padding: 10px 8px; color: #5C524C;">${p.country || '—'}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #8A8077;">${new Date(p.registered_at).toLocaleDateString()}</td>
      </tr>
    `).join('');

  const adminHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: 'Times New Roman', Times, serif; background-color: #F7F4EE; padding: 24px 12px; color: #2C2422; margin: 0;">
    <div style="max-width: 720px; margin: 0 auto; background: #FFFFFF; border: 1.5px solid #E5DCCE; border-radius: 18px; padding: 32px 28px; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
      
      <!-- Header Banner with Brand -->
      <div style="border-bottom: 2px solid #2D6A4F; padding-bottom: 20px; margin-bottom: 26px; text-align: center;">
        <span style="display: inline-block; background-color: #E8F5E9; color: #1B4332; font-family: sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid #C7E4D6; margin-bottom: 10px;">
          Painel de Notificação BabyBites
        </span>
        <h1 style="font-size: 26px; color: #1F1B1A; margin: 0; font-family: 'Times New Roman', serif; font-weight: bold;">
          Baby<span style="color: #2D6A4F;">Bites</span> — Nova Inscrição #${totalRegistered}
        </h1>
        <p style="margin: 8px 0 0 0; color: #5C524C; font-size: 14px;">
          Total acumulado até o momento: <strong>${totalRegistered} mães inscritas</strong> &bull; Vencedores: <strong>12 Acessos VIP</strong>
        </p>
      </div>

      <!-- Highlight Card of Latest Candidate -->
      <div style="background: linear-gradient(135deg, #F2F8F5 0%, #FFF8F5 100%); border: 2px solid #C7E4D6; border-radius: 14px; padding: 22px; margin-bottom: 26px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #D8EBDD; padding-bottom: 8px;">
          <span style="font-size: 13px; font-weight: bold; color: #2D6A4F; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">
            🌟 Dados da Nova Candidata (#${totalRegistered})
          </span>
          <span style="background-color: #2D6A4F; color: #FFFFFF; font-family: monospace; font-size: 16px; font-weight: bold; padding: 3px 12px; border-radius: 6px;">
            ${participant.lucky_number}
          </span>
        </div>

        <table style="width: 100%; font-size: 14px; font-family: 'Times New Roman', serif; border-collapse: collapse;">
          <tr>
            <td style="width: 150px; color: #5C524C; padding: 6px 0;"><strong>Nome Completo:</strong></td>
            <td style="font-weight: bold; color: #1F1B1A; font-size: 15px;">${participant.full_name}</td>
          </tr>
          <tr>
            <td style="color: #5C524C; padding: 6px 0;"><strong>WhatsApp / Telefone:</strong></td>
            <td style="font-weight: bold; color: #8C2C13; font-size: 15px; font-family: monospace;">${participant.phone || 'Não informado'}</td>
          </tr>
          <tr>
            <td style="color: #5C524C; padding: 6px 0;"><strong>Email:</strong></td>
            <td style="color: #1F1B1A;">${participant.email}</td>
          </tr>
          <tr>
            <td style="color: #5C524C; padding: 6px 0;"><strong>Idade do Bebé:</strong></td>
            <td style="color: #1F1B1A;">${participant.baby_age}</td>
          </tr>
          <tr>
            <td style="color: #5C524C; padding: 6px 0;"><strong>País:</strong></td>
            <td style="color: #1F1B1A;">${participant.country || 'Não especificado'}</td>
          </tr>
          <tr>
            <td style="color: #5C524C; padding: 6px 0;"><strong>Desafio Alimentar:</strong></td>
            <td style="color: #1F1B1A;">${participant.feeding_challenge || 'Nenhum'}</td>
          </tr>
          <tr>
            <td style="color: #5C524C; padding: 6px 0;"><strong>Data de Registro:</strong></td>
            <td style="color: #5C524C;">${regDateFormatted}</td>
          </tr>
        </table>
      </div>

      <!-- Cumulative Master Table -->
      <h3 style="font-size: 18px; color: #1F1B1A; margin: 0 0 8px 0; font-family: 'Times New Roman', serif;">
        📋 Lista Cumulativa Mestre (${totalRegistered} Inscritas)
      </h3>
      <p style="font-size: 13px; color: #5C524C; margin: 0 0 14px 0;">
        Esta lista cresce continuamente a cada novo registro:
      </p>
      
      <div style="overflow-x: auto; margin-bottom: 26px; border: 1px solid #E5DCCE; border-radius: 10px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #F4EFEA; border-bottom: 2px solid #E5DCCE; font-size: 11px; color: #5C524C; text-transform: uppercase; font-family: sans-serif;">
              <th style="padding: 10px 8px;">#</th>
              <th style="padding: 10px 8px;">Código</th>
              <th style="padding: 10px 8px;">Nome</th>
              <th style="padding: 10px 8px;">Telefone</th>
              <th style="padding: 10px 8px;">Email</th>
              <th style="padding: 10px 8px;">Fase Bebé</th>
              <th style="padding: 10px 8px;">País</th>
              <th style="padding: 10px 8px;">Data</th>
            </tr>
          </thead>
          <tbody>
            ${adminHtmlRows}
          </tbody>
        </table>
      </div>

      <!-- Instant CSV Copy Block right in email -->
      <div style="background-color: #FAF7F2; border: 1.5px solid #E5DCCE; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #1F1B1A; font-family: 'Times New Roman', serif; font-weight: bold;">
          📊 Dados CSV para Excel / Sheets (Copie e Cole Direto):
        </h4>
        <p style="font-size: 12px; color: #5C524C; margin: 0 0 10px 0;">
          Selecione o texto abaixo com Ctrl+A, copie com Ctrl+C e cole em qualquer planilha:
        </p>
        <pre style="background: #FFFFFF; border: 1px solid #D8CFC3; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; color: #1F1B1A; max-height: 140px; overflow-y: auto; margin: 0; white-space: pre-wrap;">${rawCsvContent}</pre>
      </div>

      <!-- Lucky Numbers Only -->
      <div style="background-color: #F8F5EE; border: 1.5px solid #E5DCCE; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #1F1B1A; font-family: 'Times New Roman', serif; font-weight: bold;">
          🎲 Apenas os Códigos da Sorte (Para o Sorteio no Random.org):
        </h4>
        <pre style="background: #FFFFFF; border: 1px solid #D8CFC3; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; color: #2D6A4F; font-weight: bold; max-height: 120px; overflow-y: auto; margin: 0;">${luckyNumbersBlock}</pre>
      </div>

      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #EDE4DA; font-size: 12px; color: #8A8077; text-align: center; font-family: sans-serif;">
        BabyBites Giveaway Automation &bull; Encerramento: <strong>20/11/2026</strong> &bull; Vencedores: <strong>21/11/2026</strong>
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

  // Send via Vite /api/send-email backend proxy (to avoid browser CORS and ensure 100% delivery)
  const sendEmailPayload = async (payload: {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
  }) => {
    try {
      // First try local backend proxy endpoint
      const proxyRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const proxyData = await proxyRes.json().catch(() => null);

      if (proxyRes.ok) {
        return { ok: true, data: proxyData };
      } else {
        console.warn('[Proxy /api/send-email Response Error]:', proxyRes.status, proxyData);
        // If proxy reported a known status, don't trigger direct CORS fetch
        return { ok: false, error: proxyData?.message || proxyData?.error || `HTTP ${proxyRes.status}` };
      }
    } catch (proxyErr) {
      console.warn('Proxy /api/send-email failed to connect, attempting direct fetch fallback:', proxyErr);
    }

    // Direct fallback if proxy is unavailable
    if (apiKey) {
      try {
        const directRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: 'BabyBites Giveaway <onboarding@resend.dev>',
            to: Array.isArray(payload.to) ? payload.to : [payload.to],
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
          }),
        });

        if (directRes.ok) {
          return { ok: true, data: await directRes.json() };
        } else {
          const errText = await directRes.text();
          return { ok: false, error: errText };
        }
      } catch (directErr: any) {
        return { ok: false, error: directErr?.message || 'Network error' };
      }
    }

    return { ok: false, error: 'No API key or server available' };
  };

  // 1. Send Admin Cumulative Notification Email to octaviomoiane2007@gmail.com
  const adminTargetEmail = 'octaviomoiane2007@gmail.com';
  console.log(`[Giveaway] Dispatching cumulative notification to admin: ${adminTargetEmail}`);

  const adminResult = await sendEmailPayload({
    to: adminTargetEmail,
    subject: adminSubject,
    text: adminBody,
    html: adminHtml,
  });

  if (adminResult.ok) {
    console.log('[Giveaway] Admin Cumulative Email Delivered Successfully! ID:', adminResult.data?.id);
    addEmailLog({
      participant_id: participant.id,
      recipient_email: adminTargetEmail,
      email_type: 'admin_notification',
      status: 'sent',
      attempts: 1,
    });
  } else {
    console.warn('[Giveaway] Admin Cumulative Email Failed:', adminResult.error);
    addEmailLog({
      participant_id: participant.id,
      recipient_email: adminTargetEmail,
      email_type: 'admin_notification',
      status: 'failed',
      error_message: adminResult.error,
      attempts: 1,
    });
  }

  // 2. Send Participant Confirmation Email (direct to participant)
  console.log(`[Giveaway] Dispatching confirmation email to participant: ${participant.email}`);
  const participantSubject = `You're officially entered, mama! 💗 Your Lucky Number: ${participant.lucky_number}`;
  const participantText = `Hi ${participant.full_name}!\n\nYou're officially entered into the BabyBites Early Access Giveaway.\n\nYour lucky number is: ${participant.lucky_number}\n\nIMPORTANT — VIP GROUP VERIFICATION:\nWe registered your WhatsApp/Phone number: ${participant.phone || 'Not specified'}.\nOur team will verify each number against our official VIP Mom Community. Participants not in the VIP group will be automatically disqualified.\n\nCampaign Schedule:\n- Registration Closes: November 20, 2026 (11:59 PM EST)\n- 7 Days Free VIP Access Begins: November 20, 2026\n- 12 Winners Announced: November 21, 2026\n\nGood luck! 💗\nBabyBites Team`;

  const participantHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: 'Times New Roman', Times, serif; background-color: #FAF7F2; padding: 24px 12px; color: #2C2422; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1.5px solid #E5DCCE; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      
      <!-- Top Brand Header -->
      <div style="text-align: center; border-bottom: 2px solid #EAE0D4; padding-bottom: 18px; margin-bottom: 24px;">
        <span style="display: inline-block; background-color: #E8F5E9; color: #1B4332; font-family: sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 20px; border: 1px solid #C7E4D6; margin-bottom: 10px;">
          BabyBites Early Access VIP Pass
        </span>
        <h1 style="font-size: 28px; color: #1F1B1A; margin: 0; font-family: 'Times New Roman', serif; font-weight: bold;">
          You're officially entered, mama! 💗
        </h1>
        <p style="margin: 6px 0 0 0; color: #5C524C; font-size: 15px;">
          Nourished with Love &bull; 300+ Pediatrician Recipes
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #2C2422; margin: 0 0 16px 0;">
        Hi <strong>${participant.full_name}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #5C524C; margin: 0 0 24px 0;">
        Your entry for the <strong>BabyBites Early Access Giveaway</strong> has been received and permanently secured in our database!
      </p>
      
      <!-- Lucky Number Ticket Box -->
      <div style="background: linear-gradient(135deg, #F2F8F5 0%, #FFFDF9 100%); border: 2.5px dashed #2D6A4F; border-radius: 16px; padding: 26px 20px; text-align: center; margin: 0 0 24px 0;">
        <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #1B4332; letter-spacing: 1.5px; font-family: sans-serif;">
          ✨ Your Official Lucky Number ✨
        </p>
        <div style="font-size: 44px; font-weight: 800; font-family: monospace; color: #2D6A4F; letter-spacing: 3px; margin: 6px 0;">
          [${participant.lucky_number}]
        </div>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #5C524C;">
          Keep this lucky number safe. It will be used in our verified, transparent external draw on Random.org!
        </p>
      </div>

      <!-- Mandatory VIP Group Warning in English -->
      <div style="background-color: #FFF6F0; border: 2px solid #FBD3C1; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: bold; color: #B23B1B; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif; margin-bottom: 6px;">
          ⚠️ Mandatory Notice — VIP Group Verification
        </div>
        <p style="font-size: 14px; color: #8C2C13; line-height: 1.6; margin: 0;">
          We recorded your WhatsApp / phone number: <strong>${participant.phone || 'Not specified'}</strong>.<br/>
          Our team will verify each number against our official <strong>VIP Mom Community</strong>. All participants who are not active in the VIP group will be automatically disqualified from the giveaway.
        </p>
      </div>

      <!-- Timeline Schedule -->
      <div style="background-color: #FAF8F5; border: 1px solid #EAE0D4; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 16px; color: #1F1B1A; margin: 0 0 12px 0; font-family: 'Times New Roman', serif; font-weight: bold;">
          Official Campaign Schedule:
        </h3>
        <ul style="font-size: 14px; color: #5C524C; line-height: 1.9; margin: 0; padding-left: 20px;">
          <li><strong>November 20, 2026:</strong> Registration closes at 11:59 PM EST &amp; 7-day complimentary VIP access begins!</li>
          <li><strong>November 21, 2026:</strong> Official announcement of the 12 lucky winners!</li>
        </ul>
      </div>

      <!-- Details Summary -->
      <table style="width: 100%; font-size: 13px; color: #5C524C; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 4px 0; width: 140px;"><strong>Name:</strong></td><td style="color: #1F1B1A; font-weight: bold;">${participant.full_name}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>WhatsApp:</strong></td><td style="color: #1F1B1A; font-weight: bold; font-family: monospace;">${participant.phone || '—'}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Email:</strong></td><td style="color: #1F1B1A;">${participant.email}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Baby's Age:</strong></td><td style="color: #1F1B1A;">${participant.baby_age}</td></tr>
      </table>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #EDE4DA; font-size: 13px; color: #8A8077; text-align: center;">
        Good luck, mama! 💗 &bull; BabyBites Team
      </div>
    </div>
  </body>
  </html>
  `;

  const participantResult = await sendEmailPayload({
    to: participant.email,
    subject: participantSubject,
    text: participantText,
    html: participantHtml,
  });

  if (participantResult.ok) {
    console.log('[Giveaway] Participant Confirmation Delivered! ID:', participantResult.data?.id);
    addEmailLog({
      participant_id: participant.id,
      recipient_email: participant.email,
      email_type: 'participant_confirmation',
      status: 'sent',
      attempts: 1,
    });
  } else {
    console.warn('[Giveaway] Direct Participant Email restricted by Resend sandbox (needs custom domain).');
    
    // Also send a copy of the participant confirmation to admin so the moderator sees the participant confirmation!
    await sendEmailPayload({
      to: adminTargetEmail,
      subject: `[Participant Confirmation Copy] Sent to ${participant.email}: Lucky Number ${participant.lucky_number}`,
      text: `Participant confirmation sent to ${participant.email}:\n\n${participantText}`,
      html: participantHtml,
    });

    addEmailLog({
      participant_id: participant.id,
      recipient_email: participant.email,
      email_type: 'participant_confirmation',
      status: 'failed',
      error_message: participantResult.error || 'Resend sandbox requires custom domain to send to external recipients. Confirmation copy forwarded to admin.',
      attempts: 1,
    });
  }

  return { 
    adminSent: !!adminResult.ok, 
    participantSent: !!participantResult.ok 
  };
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

        // Trigger emails with cumulative list (awaited)
        await dispatchGiveawayEmails(participant, localList);
        await dispatchGiveawayWebhook(participant, localList);
        return { success: true, participant };
      }
    } catch (rpcErr: any) {
      console.warn('Supabase RPC call failed, falling back to local database storage:', rpcErr);
    }
  }

  // Local storage handling (enforcing uniqueness and atomic lucky number)
  const existing = getLocalParticipants();
  const existingIndex = existing.findIndex(p => p.normalized_email === normalized);
  
  if (existingIndex !== -1) {
    // If already registered, update their details (e.g. phone/baby age) and re-dispatch emails so testing works seamlessly!
    const existingP = existing[existingIndex];
    existingP.full_name = data.fullName.trim();
    existingP.phone = data.phone.trim();
    existingP.baby_age = data.babyAge;
    existingP.country = data.country?.trim() || existingP.country;
    existingP.feeding_challenge = data.feedingChallenge?.trim() || existingP.feeding_challenge;
    existingP.updated_at = new Date().toISOString();
    
    existing[existingIndex] = existingP;
    saveLocalParticipants(existing);

    // Re-dispatch emails with complete cumulative list!
    await dispatchGiveawayEmails(existingP, existing);
    await dispatchGiveawayWebhook(existingP, existing);

    return {
      success: true,
      participant: existingP,
    };
  }

  const luckyNumber = generateNextLuckyNumber(existing);
  const now = new Date().toISOString();

  const newParticipant: Participant = {
    id: 'bb-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
    full_name: data.fullName.trim(),
    email: data.email.trim(),
    normalized_email: normalized,
    phone: data.phone.trim(),
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

  // Dispatch emails with complete cumulative list (fully awaited)!
  await dispatchGiveawayEmails(newParticipant, existing);

  // Dispatch real-time webhook event!
  await dispatchGiveawayWebhook(newParticipant, existing);

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
