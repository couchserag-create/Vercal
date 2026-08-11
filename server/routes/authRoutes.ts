import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { body, validationResult } from 'express-validator';
import { getUserByEmail, saveUser, getUserById, addAuditLog } from '../db.ts';
import { signToken, authenticateJWT, AuthRequest } from '../middleware/auth.ts';
import { authRateLimiter, generateCsrfToken } from '../middleware/security.ts';

const router = express.Router();

// Get CSRF Token
router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  res.json({ csrfToken: token });
});

// User Registration with Bcrypt Password Hashing & Input Validation
router.post(
  '/register',
  authRateLimiter,
  [
    body('name').trim().notEmpty().withMessage('الاسم مطلوب'),
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة السر يجب ألا تقل عن 6 أحرف')
  ],
  async (req: express.Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { name, email, password, company } = req.body;

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: '⛔ البريد الإلكتروني مسجل بالفعل في النظام.'
      });
    }

    // Bcrypt Password Hashing
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;

    const newUser = {
      id: userId,
      name,
      email,
      role: 'client' as const,
      company: company || '',
      passwordHash,
      is2FAEnabled: false,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);

    addAuditLog({
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: '👤 تسجيل حساب جديد',
      name,
      email,
      company: company || '-',
      role: 'عميل',
      details: 'تم إنشاء الحساب بكلمة سر مشفرة ببروتوكول Bcrypt.'
    });

    const token = signToken({
      id: userId,
      email,
      role: 'client',
      is2FAVerified: true
    });

    res.status(201).json({
      status: 'success',
      message: '✅ تم إنشاء الحساب بنجاح بأعلى معايير التشفير.',
      token,
      user: {
        id: userId,
        name,
        email,
        role: 'client',
        company,
        is2FAEnabled: false,
        createdAt: newUser.createdAt
      }
    });
  }
);

// User Login with Bcrypt Password Verification & 2FA Check
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').notEmpty().withMessage('كلمة السر مطلوبة')
  ],
  async (req: express.Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = getUserByEmail(email);

    if (!user) {
      addAuditLog({
        timestamp: new Date().toLocaleString('ar-EG'),
        eventType: '❌ محاولة دخول بريد غير مسجل',
        name: 'زائر',
        email,
        company: '-',
        details: 'محاولة تسجيل دخول ببريد غير مسجل بالنظام.'
      });
      return res.status(401).json({
        status: 'error',
        message: '⛔ البريد الإلكتروني أو كلمة السر غير صحيحة.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      addAuditLog({
        timestamp: new Date().toLocaleString('ar-EG'),
        eventType: '❌ كلمة سر خاطئة',
        name: user.name,
        email,
        company: user.company || '-',
        details: 'محاولة دخول بكلمة سر خاطئة.'
      });
      return res.status(401).json({
        status: 'error',
        message: '⛔ البريد الإلكتروني أو كلمة السر غير صحيحة.'
      });
    }

    // Check if 2FA is required for this user
    if (user.is2FAEnabled) {
      const tempToken = signToken(
        { id: user.id, email: user.email, role: user.role, is2FAVerified: false },
        '10m'
      );
      return res.json({
        status: 'requires_2fa',
        message: '🔑 يتطلب الحساب إدخال رمز التحقق الثنائي (2FA Verification Code).',
        tempToken,
        is2FARequired: true
      });
    }

    // Login Successful
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      is2FAVerified: true
    });

    addAuditLog({
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: '🔓 تسجيل دخول ناجح',
      name: user.name,
      email: user.email,
      company: user.company || '-',
      role: user.role === 'admin' ? 'مدير المنظومة' : 'عميل',
      details: 'تم التوثيق بكلمة السر وتوليد جلسة JWT آمنة.'
    });

    res.json({
      status: 'success',
      message: '✅ تم تسجيل الدخول بنجاح.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        is2FAEnabled: user.is2FAEnabled,
        createdAt: user.createdAt
      }
    });
  }
);

// Verify 2FA TOTP Code during login
router.post('/verify-2fa', authRateLimiter, async (req: express.Request, res: Response) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ status: 'error', message: 'رمز الدخول المؤقت ورمز التحقق مطلوبان.' });
  }

  const authReq = req as AuthRequest;
  const decoded = signToken ? jwt.verify(tempToken, process.env.JWT_SECRET || 'fitbrilliance_secure_jwt_secret_2026_key') as any : null;

  if (!decoded || !decoded.id) {
    return res.status(401).json({ status: 'error', message: 'رمز الجلسة المؤقتة منتهي الصلاحية.' });
  }

  const user = getUserById(decoded.id);
  if (!user || !user.twoFactorSecret) {
    return res.status(400).json({ status: 'error', message: 'نظام التحقق الثنائي غير مفعّل لهذا الحساب.' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code.trim(),
    window: 2 // allow 60sec window skew
  });

  if (!verified) {
    return res.status(400).json({
      status: 'error',
      message: '⛔ رمز التحقق الثنائي (2FA) غير صحيح. يرجى مراجعة تطبيق Authenticator.'
    });
  }

  const fullToken = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    is2FAVerified: true
  });

  addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: '🔐 دخول ناجح عبر 2FA',
    name: user.name,
    email: user.email,
    company: user.company || '-',
    role: user.role === 'admin' ? 'مدير المنظومة' : 'عميل',
    details: 'تم تأكيد التوثيق الثنائي عبر تطبيق Authenticator.'
  });

  res.json({
    status: 'success',
    message: '✅ تم اجتياز التحقق الثنائي بنجاح.',
    token: fullToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      is2FAEnabled: true,
      createdAt: user.createdAt
    }
  });
});

// Setup 2FA: Generate secret & QR Code
router.post('/2fa/setup', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ status: 'error', message: 'المستخدم غير موجود' });

  const secret = speakeasy.generateSecret({
    name: `FitBrilliance (${user.email})`,
    issuer: 'FitBrilliance ToDo4U'
  });

  user.tempTwoFactorSecret = secret.base32;
  saveUser(user);

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

  res.json({
    status: 'success',
    secret: secret.base32,
    qrCodeUrl,
    otpauthUrl: secret.otpauth_url
  });
});

// Confirm 2FA setup with TOTP code
router.post('/2fa/confirm', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  const user = getUserById(req.user!.id);

  if (!user || !user.tempTwoFactorSecret) {
    return res.status(400).json({ status: 'error', message: 'لم يتم التمهيد لإعداد 2FA.' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.tempTwoFactorSecret,
    encoding: 'base32',
    token: code.trim(),
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ status: 'error', message: '⛔ رمز 2FA غير صحيح. جرب رمزاً أحدث.' });
  }

  user.is2FAEnabled = true;
  user.twoFactorSecret = user.tempTwoFactorSecret;
  delete user.tempTwoFactorSecret;
  saveUser(user);

  addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: '🔒 تفعيل نظام 2FA الحسابي',
    name: user.name,
    email: user.email,
    company: user.company || '-',
    details: 'تم تفعيل حماية التحقق الثنائي بررمز TOTP.'
  });

  res.json({
    status: 'success',
    message: '✅ تم تفعيل التحقق الثنائي (2FA) بنجاح لزيادة أمان الحساب.'
  });
});

// Disable 2FA
router.post('/2fa/disable', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = getUserById(req.user!.id);
  if (!user) return res.status(404).json({ status: 'error', message: 'المستخدم غير موجود' });

  user.is2FAEnabled = false;
  delete user.twoFactorSecret;
  delete user.tempTwoFactorSecret;
  saveUser(user);

  res.json({ status: 'success', message: 'تم إيقاف 2FA لهذا الحساب.' });
});

// Silent Heartbeat Endpoint for active JWT session freshness & token validation
router.get('/heartbeat', authenticateJWT, (req: AuthRequest, res: Response) => {
  const user = getUserById(req.user!.id);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'الجلسة ملغاة أو غير صالحة.' });
  }

  res.json({
    status: 'success',
    active: true,
    timestamp: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// Get Current User Profile
router.get('/me', authenticateJWT, (req: AuthRequest, res: Response) => {
  const user = getUserById(req.user!.id);
  if (!user) return res.status(404).json({ status: 'error', message: 'المستخدم غير موجود' });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      is2FAEnabled: user.is2FAEnabled,
      createdAt: user.createdAt
    }
  });
});

export default router;
