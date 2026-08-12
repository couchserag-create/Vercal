import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { sanitizeInputs, apiRateLimiter, requireCsrf } from './middleware/security.ts';
import authRoutes from './routes/authRoutes.ts';
import projectRoutes from './routes/projectRoutes.ts';
import coachRoutes from './routes/coachRoutes.ts';
import ledgerRoutes from './routes/ledgerRoutes.ts';
import backupRoutes from './routes/backupRoutes.ts';
import docsRoutes from './routes/docsRoutes.ts';

export function createExpressApp() {
  const app = express();
  app.disable('x-powered-by');

  // Enable trust proxy for Cloud Run / Vercel / Nginx reverse proxy
  app.set('trust proxy', 1);

  // 1. Helmet HTTP Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'", 'https:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
      strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
    })
  );

  // 2. Cookie Parser & Body Parsers
  app.use(cookieParser());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 3. Input Sanitization Middleware
  app.use(sanitizeInputs);

  // 4. Global API Rate Limiter
  app.use('/api/', apiRateLimiter);
  app.use('/api/', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    next();
  });

  // 5. Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FitBrilliance ToDo4U Secure Full-Stack API',
      timestamp: new Date().toISOString(),
      security: 'Active (JWT + 2FA + Bcrypt + Helmet + CSRF + AES-256 DB)'
    });
  });

  // Every state-changing API request must present a signed CSRF token.
  app.use('/api/', requireCsrf);

  // 6. Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/coach-info', coachRoutes);
  app.use('/api/ledger', ledgerRoutes);
  app.use('/api/backup', backupRoutes);
  app.use('/api/docs', docsRoutes);

  return app;
}

export default createExpressApp;
