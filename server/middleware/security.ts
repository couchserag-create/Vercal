import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// Rate Limiter for Authentication routes (Brute force protection)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    status: 'error',
    message: '⛔ تجاوزت حد محاولات تسجيل الدخول المسموح بها. يرجى الانتظار 15 دقيقة وإعادة المحاولة لضمان الأمان.'
  }
});

// Rate Limiter for general API endpoints (DDoS protection)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    status: 'error',
    message: '⛔ تم تجاوز معدل الطلبات المسموح به لخادم البيانات. يرجى التمهل وتكرار الطلب لاحقاً.'
  }
});

// Sanitize string against XSS & script injection
export function cleanString(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove scripts
    .replace(/javascript:/gi, '') // remove javascript: URIs
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/eval\s*\(/gi, '');
}

// XSS / Injection Input Sanitizer Middleware
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = cleanString(req.body[key]);
      }
    }
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = cleanString(req.query[key] as string);
      }
    }
  }
  next();
}

// CSRF Double Submit Token Helper
const CSRF_SECRET = process.env.CSRF_SECRET || 'fitbrilliance_csrf_token_secret_key_2026';

export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', CSRF_SECRET).update(timestamp).digest('hex');
  return `${timestamp}.${hmac}`;
}

export function verifyCsrfToken(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [timestamp, hmac] = token.split('.');
  const timeNum = parseInt(timestamp, 10);
  if (isNaN(timeNum) || Date.now() - timeNum > 24 * 60 * 60 * 1000) {
    return false; // expired token after 24h
  }
  const expectedHmac = crypto.createHmac('sha256', CSRF_SECRET).update(timestamp).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
}

// CSRF Verification Middleware for state-changing requests (POST, PUT, DELETE)
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const csrfHeader = req.headers['x-csrf-token'] as string || req.headers['x-xsrf-token'] as string || req.body?._csrf;
  
  if (!csrfHeader || !verifyCsrfToken(csrfHeader)) {
    return res.status(403).json({
      status: 'error',
      message: '⛔ رمُز حماية CSRF غير صحيح أو منتهي الصلاحية. يرجى إعادة تحديث الصفحة.'
    });
  }
  next();
}
