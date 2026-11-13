import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Backend email dispatcher plugin to bypass browser CORS and guarantee Resend delivery
function resendBackendPlugin(apiKey: string, adminEmail: string) {
  const handler = async (req: any, res: any) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });

    req.on('end', async () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      try {
        const data = JSON.parse(body || '{}');
        const token = apiKey || process.env.VITE_RESEND_API_KEY || '';
        const targetAdmin = adminEmail || 'octaviomoiane2007@gmail.com';
        const requestedRecipient = data.to || targetAdmin;
        const recipients = Array.isArray(requestedRecipient) ? requestedRecipient : [requestedRecipient];

        console.log(`[Resend Backend] Attempting email dispatch to: ${recipients.join(', ')} | Subject: "${data.subject}"`);

        // Attempt delivery to requested recipient
        let resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({
            from: data.from || 'BabyBites Giveaway <onboarding@resend.dev>',
            to: recipients,
            subject: data.subject,
            text: data.text,
            html: data.html,
          }),
        });

        let resendData = await resendRes.json();

        // If Resend returns 403 sandbox restriction (because recipient is not the account owner)
        // automatically deliver to the admin account so the administrator never loses a single registration!
        if (resendRes.status === 403 && resendData?.message?.includes('testing emails')) {
          console.warn(`[Resend Backend] 403 Sandbox restriction: ${recipients.join(', ')} is external. Rerouting to verified admin ${targetAdmin}`);

          const sandboxNote = `<div style="background-color:#FFFBEB;border:2px solid #FDE68A;padding:14px;border-radius:10px;margin-bottom:20px;font-family:sans-serif;font-size:13px;color:#92400E;">
            <strong>⚠️ [AVISO DE TESTE RESEND SANDBOX]</strong><br>
            Este email foi emitido para a candidata: <strong>${recipients.join(', ')}</strong>.<br>
            Como a conta Resend está em modo gratuito com o domínio <code>onboarding@resend.dev</code>, o Resend redireciona para o email mestre do administrador (<code>${targetAdmin}</code>).<br>
            <em>Para entregar diretamente ao email pessoal de todas as mães, verifique o domínio próprio em resend.com/domains.</em>
          </div>`;

          const fallbackHtml = data.html ? `${sandboxNote}${data.html}` : undefined;
          const fallbackText = `[AVISO RESEND SANDBOX: Destinado à candidata ${recipients.join(', ')}]\n\n${data.text || ''}`;

          resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.trim()}`,
            },
            body: JSON.stringify({
              from: 'BabyBites Giveaway <onboarding@resend.dev>',
              to: [targetAdmin],
              subject: `[Cópia Candidata: ${recipients.join(', ')}] ${data.subject}`,
              text: fallbackText,
              html: fallbackHtml,
            }),
          });

          resendData = await resendRes.json();
          console.log('[Resend Backend Rerouted Result]:', resendData);
        }

        console.log('[Resend Backend Final Status]:', resendRes.status, resendData);
        res.statusCode = resendRes.status;
        res.end(JSON.stringify(resendData));
      } catch (err: any) {
        console.error('[Resend Backend Error]:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
  };

  return {
    name: 'vite-resend-backend',
    configureServer(server: any) {
      server.middlewares.use('/api/send-email', handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/send-email', handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
  const adminEmail = env.VITE_ADMIN_EMAIL || 'octaviomoiane2007@gmail.com';

  return {
    plugins: [
      react(),
      resendBackendPlugin(apiKey, adminEmail),
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});

