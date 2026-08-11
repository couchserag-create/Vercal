import express from 'express';
import { ApiEndpointDoc } from '../../src/types.ts';

const router = express.Router();

const API_DOCUMENTATION: ApiEndpointDoc[] = [
  {
    path: '/api/auth/csrf-token',
    method: 'GET',
    summary: 'توليد رمز حماية CSRF',
    description: 'يُرجع رمز CSRF مؤقت للتحقق من سلامة الطلبات القادمة ومنع هجمات التزوير عبر المواقع.',
    protected: false,
    rateLimit: '200 req / 15 min',
    responseExample: { csrfToken: '1723456789.a1b2c3d4e5f6...' }
  },
  {
    path: '/api/auth/register',
    method: 'POST',
    summary: 'إنشاء حساب جديد بتشفير Bcrypt',
    description: 'تسجيل مستخدم جديد مع تشفير كلمة السر باستخدام خوارزمية Bcrypt وتدقيق المدخلات لمنع الثغرات.',
    protected: false,
    rateLimit: '15 req / 15 min (Auth Limiter)',
    requestBodyExample: { name: 'أحمد علي', email: 'ahmed@company.com', password: 'SecretPassword123!', company: 'شركة النماذج' },
    responseExample: { status: 'success', token: 'eyJhbGciOiJIUzI1Ni...', user: { id: 'usr_123', name: 'أحمد علي' } }
  },
  {
    path: '/api/auth/login',
    method: 'POST',
    summary: 'تسجيل الدخول وإصدار توكن JWT',
    description: 'التحقق من البريد وكلمة السر المشفرة وإصدار رمز JWT صالحة لمدة 24 ساعة. يدعم التوجيه للتحقق الثنائي 2FA عند التفعيل.',
    protected: false,
    rateLimit: '15 req / 15 min (Auth Limiter)',
    requestBodyExample: { email: 'couch.serag@gmail.com', password: '0020303' },
    responseExample: { status: 'success', token: 'eyJhbGciOiJIUzI1Ni...', user: { email: 'couch.serag@gmail.com', is2FAEnabled: true } }
  },
  {
    path: '/api/auth/verify-2fa',
    method: 'POST',
    summary: 'التحقق من رمز 2FA عند الدخول',
    description: 'فحص رمز TOTP المكون من 6 أرقام وتأكيد التوثيق الثنائي لإكمال عملية تسجيل الدخول.',
    protected: false,
    rateLimit: '15 req / 15 min',
    requestBodyExample: { tempToken: 'eyJhbGci...', code: '123456' },
    responseExample: { status: 'success', token: 'eyJhbGci...', message: 'تم اجتياز التحقق الثنائي' }
  },
  {
    path: '/api/auth/2fa/setup',
    method: 'POST',
    summary: 'توليد مفتاح ورمز QR للتحقق الثنائي',
    description: 'إنشاء المفتاح السري وتوليد رمز QR بدقة عالية لتطبيقات Google Authenticator / Authy.',
    protected: true,
    requires2FA: false,
    rateLimit: '50 req / 15 min',
    responseExample: { status: 'success', secret: 'JBSWY3DPEHPK3PXP', qrCodeUrl: 'data:image/png;base64,...' }
  },
  {
    path: '/api/projects',
    method: 'GET',
    summary: 'عرض قائمة المشروعات المحمية',
    description: 'استرجاع قائمة المشروعات المحفوظة بالنظام مع الميزانيات التشغيلية والروابط.',
    protected: false,
    rateLimit: '200 req / 15 min',
    responseExample: { status: 'success', projects: [{ id: 'PRJ-101', name: 'مشروع النمذجة', company: 'FitBrilliance' }] }
  },
  {
    path: '/api/projects',
    method: 'POST',
    summary: 'إضافة/تحديث مشروع (خاص بالإدارة)',
    description: 'إنشاء أو تعديل مشروع واستراتيجية 90 يوم حسابية مع احتساب التكاليف والـ ROI.',
    protected: true,
    requires2FA: false,
    rateLimit: '50 req / 15 min',
    requestBodyExample: { id: 'PRJ-102', name: 'استراتيجية التوسع', company: 'شركة الريادة' },
    responseExample: { status: 'success', message: 'تم حفظ المشروع بنجاح' }
  },
  {
    path: '/api/backup/export',
    method: 'POST',
    summary: 'إنشاء واستخراج نسخة احتياطية مشفرة',
    description: 'توليد نسخة احتياطية فورية لقواعد البيانات والمستندات ببروتوكول تشفير AES-256 عند الحفظ.',
    protected: true,
    requires2FA: true,
    rateLimit: '10 req / 15 min',
    responseExample: { status: 'success', backup: { id: 'backup_1723456789', sizeBytes: 15420 } }
  },
  {
    path: '/api/backup/restore',
    method: 'POST',
    summary: 'استعادة قواعد البيانات من نسخة احتياطية',
    description: 'إعادة بناء البيانات والأنظمة والمشاريع بالكامل من كود النسخة الاحتياطية المحددة.',
    protected: true,
    requires2FA: true,
    rateLimit: '5 req / 15 min',
    requestBodyExample: { backupId: 'backup_1723456789' },
    responseExample: { status: 'success', message: 'تم استعادة البيانات بالكامل' }
  }
];

router.get('/endpoints', (req, res) => {
  res.json({
    status: 'success',
    title: 'وثيقة واجهة البرمجة التفاعلية (FitBrilliance Security API)',
    version: '1.0.0',
    securityStandards: {
      authType: 'Bearer JWT (JSON Web Tokens)',
      encryption: 'AES-256-CBC at rest / SSL-TLS in transit',
      hashAlgorithm: 'Bcrypt (Salt Rounds: 10)',
      headerSecurity: 'Helmet Security Headers Enabled',
      attackProtections: ['Rate Limiting', 'XSS Sanitization', 'CSRF Double Submit Tokens', 'SQL/NoSQL Injection Audit']
    },
    endpoints: API_DOCUMENTATION
  });
});

export default router;
