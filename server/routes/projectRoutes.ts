import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getProjects, getProjectById, getUserById, saveProject, deleteProject, addAuditLog } from '../db.ts';
import crypto from 'crypto';
import { authenticateJWT, requireAdmin, AuthRequest, signToken, verifyToken } from '../middleware/auth.ts';
import { projectAccessRateLimiter } from '../middleware/security.ts';
import { securityConfig } from '../config.ts';

const router = express.Router();

// Project lists are administration-only. Never expose the catalogue of private reports.
router.get('/', authenticateJWT, requireAdmin, (req, res) => {
  const projects = getProjects();
  res.json({ status: 'success', projects });
});

// Lookup deliberately returns only the minimum metadata needed to begin a protected access flow.
router.get('/lookup/:id', projectAccessRateLimiter, (req, res) => {
  const project = getProjectById(req.params.id);
  if (!project) return res.status(404).json({ status: 'error', message: 'المشروع غير موجود' });
  res.json({ status: 'success', project: { id: project.id, name: project.name, company: project.company, domain: project.domain } });
});

// An approved viewer receives a short-lived, project-scoped token. The shared access secret
// lives only in Vercel environment variables and is never returned to the browser.
router.post('/:id/access', projectAccessRateLimiter, (req, res) => {
  const { accessCode } = req.body;
  if (typeof accessCode !== 'string' || accessCode.length < 32) {
    return res.status(400).json({ status: 'error', message: 'رمز الدخول غير صالح.' });
  }
  const supplied = Buffer.from(accessCode);
  const expected = Buffer.from(securityConfig.projectAccessSecret);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ status: 'error', message: 'رمز الدخول غير صحيح.' });
  }
  const project = getProjectById(req.params.id);
  if (!project) return res.status(404).json({ status: 'error', message: 'المشروع غير موجود' });
  const token = signToken({ scope: 'project_viewer', projectId: project.id }, '20m');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({ status: 'success', token, expiresIn: 1200 });
});

// Full report data is available only to the administrator or to a valid project-scoped token.
router.get('/:id', (req: AuthRequest, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const decoded = token ? verifyToken(token) : null;
  const isAdmin = decoded?.id && getUserById(decoded.id)?.role === 'admin';
  const hasProjectAccess = decoded?.scope === 'project_viewer' && decoded?.projectId === id;
  if (!isAdmin && !hasProjectAccess) {
    return res.status(401).json({ status: 'error', message: '⛔ يلزم رمز دخول صالح لفتح التقرير.' });
  }
  const project = getProjectById(id);
  if (!project) {
    return res.status(404).json({ status: 'error', message: 'المشروع غير موجود' });
  }
  res.json({ status: 'success', project });
});

// POST create / update project (Admin Only)
router.post(
  '/',
  authenticateJWT,
  requireAdmin,
  [
    body('id').trim().notEmpty().withMessage('رقم/كود المشروع مطلوب'),
    body('name').trim().notEmpty().withMessage('اسم المشروع مطلوب'),
    body('company').trim().notEmpty().withMessage('اسم الشركة مطلوب')
  ],
  (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const projectData = req.body;
    const saved = saveProject(projectData);

    addAuditLog({
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: '📁 حفظ/تحديث مشروع',
      name: req.user?.name || 'المدير',
      email: req.user?.email || '-',
      company: projectData.company,
      role: 'مدير المنظومة',
      details: `تم حفظ المشروع (${saved.id} - ${saved.name}) مع الميزانية والخطط.`
    });

    res.json({
      status: 'success',
      message: '✅ تم حفظ المشروع بنجاح وتأمين خطة العمل.',
      project: saved
    });
  }
);

// DELETE project (Admin Only)
router.delete('/:id', authenticateJWT, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = deleteProject(id);
  if (!success) {
    return res.status(404).json({ status: 'error', message: 'المشروع غير موجود لكونه محذوفاً بالفعل' });
  }

  addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: '🗑️ حذف مشروع',
    name: req.user?.name || 'المدير',
    email: req.user?.email || '-',
    company: 'FitBrilliance',
    role: 'مدير المنظومة',
    details: `تم حذف المشروع (${id}) من قاعدة البيانات.`
  });

  res.json({ status: 'success', message: 'تم حذف المشروع بنجاح.' });
});

export default router;
