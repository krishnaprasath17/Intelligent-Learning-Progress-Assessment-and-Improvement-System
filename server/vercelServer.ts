import express, { Request, Response } from 'express';
import { apiRouter } from './apiRouter';
import { db } from './db';

const app = express();
app.use(express.json());

// Vercel's dynamic function route only matches one segment, so deep API paths
// are rewritten to /api/index with their original path in this query parameter.
app.use((req: Request, _res: Response, next) => {
  const requestUrl = new URL(req.url, 'http://localhost');
  const apiPath = requestUrl.searchParams.get('__vercel_path');

  if (apiPath !== null) {
    requestUrl.searchParams.delete('__vercel_path');
    const query = requestUrl.searchParams.toString();
    req.url = `/${apiPath.replace(/^\/+/, '')}${query ? `?${query}` : ''}`;
    req.originalUrl = req.url;
  }

  next();
});

app.use((_req: Request, res: Response, next) => {
  const send = res.send.bind(res);
  res.send = ((body?: any) => {
    void db.flushPendingWrites()
      .then(() => send(body))
      .catch(next);
    return res;
  }) as Response['send'];
  next();
});

// Health check endpoints
app.get(['/health', '/healthz', '/api/health', '/api/healthz'], (_req: Request, res: Response) => {
  const storage = db.getStorageDiagnostic();
  res.status(200).json({
    status: storage.isServerless && !storage.isPersistent ? 'degraded' : 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless',
    storage,
  });
});

// Normalize /api prefix if present on incoming URL
app.use((req: Request, _res: Response, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }
  next();
});

// Mount authoritative API router at both / and /api for maximum routing resilience on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback 404 handler for API routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('API Server Error:', err);
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

export default app;
