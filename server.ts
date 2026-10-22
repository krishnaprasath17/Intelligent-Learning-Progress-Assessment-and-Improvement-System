import express from 'express';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/apiRouter';

function determinePort(): number {
  // 1. Check command line arguments (--port 3000 or -p 3000)
  const portArgIdx = process.argv.findIndex(arg => arg === '--port' || arg === '-p');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const parsed = Number(process.argv[portArgIdx + 1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. Check APP_PORT
  if (process.env.APP_PORT) {
    const parsed = Number(process.env.APP_PORT);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 3. Use the platform-provided port in production.
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const parsed = Number(process.env.PORT);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 4. Local development default.
  return 3000;
}

async function startServer() {
  const app = express();
  const PORT = determinePort();

  app.use(express.json());

  // Health check & API routes FIRST (Cloud Run & container readiness)
  app.get(['/health', '/healthz', '/api/health'], (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);

  // API 404 handler for missing /api routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // API error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  // Vite middleware in development mode, static serving in production
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(process.cwd(), 'dist');

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
