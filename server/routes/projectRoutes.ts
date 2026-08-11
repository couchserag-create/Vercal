import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getProjects, getProjectById, saveProject, deleteProject, addAuditLog } from '../db.ts';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET all projects
router.get('/', (req, res) => {
  const projects = getProjects();
  res.json({ status: 'success', projects });
});

// GET single project by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
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
