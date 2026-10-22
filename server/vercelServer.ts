import express, { Request, Response } from 'express';
import { apiRouter } from './apiRouter';

const app = express();
app.use(express.json());

// Health check endpoints
app.get(['/health', '/healthz', '/api/health', '/api/healthz'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless',
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
