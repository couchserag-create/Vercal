import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../db.ts';
import { securityConfig } from '../config.ts';

const JWT_SECRET = securityConfig.jwtSecret;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'client';
    name: string;
    is2FAEnabled: boolean;
    is2FAVerified?: boolean;
  };
}

export function signToken(payload: object, expiresIn: string | number = '24h'): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: '⛔ يتطلب الوصول رمز توثيق JWT (Bearer Token) مشفر.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      status: 'error',
      message: '⛔ جلسة الدخول منتهية أو رمز التوثيق غير صالح. يرجى إعادة تسجيل الدخول.'
    });
  }

  const user = getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: '⛔ الحساب غير موجود في النظام المحمي.'
    });
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    is2FAEnabled: user.is2FAEnabled,
    is2FAVerified: decoded.is2FAVerified ?? false
  };

  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: '⛔ هذه العملية مقتصرة حصرياً على مدير المنظومة (Admin Access Only).'
    });
  }
  next();
}

export function require2FAVerified(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.is2FAEnabled && !req.user?.is2FAVerified) {
    return res.status(403).json({
      status: 'error',
      message: '⛔ تتطلب هذه العملية الحساسة تأكيد رمز التحقق الثنائي (2FA Verification Code).'
    });
  }
  next();
}
