import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'webhook-receiver-middleware',
      configureServer(server) {
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
});
