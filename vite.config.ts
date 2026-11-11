import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Backend email dispatcher plugin to bypass browser CORS and guarantee Resend delivery
function resendBackendPlugin(apiKey: string, adminEmail: string) {
  return {
    name: 'vite-resend-backend',
    configureServer(server: any) {
      server.middlewares.use('/api/send-email', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const token = apiKey || process.env.VITE_RESEND_API_KEY || '';
            const recipient = data.to || adminEmail || 'octaviomoiane2007@gmail.com';

            console.log(`[Resend Backend] Sending email to ${recipient} with subject "${data.subject}"`);

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.trim()}`,
              },
              body: JSON.stringify({
                from: data.from || 'BabyBites Giveaway <onboarding@resend.dev>',
                to: Array.isArray(recipient) ? recipient : [recipient],
                subject: data.subject,
                text: data.text,
                html: data.html,
              }),
            });

            const resendData = await resendRes.json();
            console.log('[Resend Backend Result]:', resendData);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = resendRes.status;
            res.end(JSON.stringify(resendData));
          } catch (err: any) {
            console.error('[Resend Backend Error]:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
        });
      });
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

