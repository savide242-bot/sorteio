import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
  const adminEmail = env.VITE_ADMIN_EMAIL || 'octaviomoiane2007@gmail.com';

  const sendEmailHandler = async (req: any, res: any) => {
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
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', async () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      try {
        const data = JSON.parse(body || '{}');
        const token = apiKey;
        const targetAdmin = adminEmail;
        const requestedRecipient = data.to || targetAdmin;
        const recipients = Array.isArray(requestedRecipient) ? requestedRecipient : [requestedRecipient];

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

        if (resendRes.status === 403 && resendData?.message?.includes('testing emails')) {
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
              text: data.text,
              html: data.html,
            }),
          });
          resendData = await resendRes.json();
        }

        res.statusCode = resendRes.status;
        res.end(JSON.stringify(resendData));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
  };

  return {
    plugins: [
      react(),
      {
        name: 'dashboard-apis',
        configureServer(server) {
          server.middlewares.use('/api/send-email', sendEmailHandler);
          server.middlewares.use('/api/webhook', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const parsed = JSON.parse(body);
                  console.log('>>> [STANDALONE DASHBOARD] Webhook received:', parsed.event, parsed.participant?.lucky_number);
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                  });
                  res.end(JSON.stringify({ success: true, receivedAt: new Date().toISOString() }));
                } catch (e) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
              });
            } else if (req.method === 'OPTIONS') {
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-BabyBites-Event',
              });
              res.end();
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'Webhook endpoint active and listening' }));
            }
          });
        },
      },
    ],
    server: {
      port: 5174,
      host: true,
    },
  };
});
