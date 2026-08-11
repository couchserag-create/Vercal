import express, { Response } from 'express';
import { createBackup, getBackups, restoreBackup, addAuditLog } from '../db.ts';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get list of available backups (Admin Only)
router.get('/list', authenticateJWT, requireAdmin, (req: AuthRequest, res: Response) => {
  const backups = getBackups();
  res.json({ status: 'success', backups });
});

// Trigger manual DB backup creation (Admin Only)
router.post('/export', authenticateJWT, requireAdmin, (req: AuthRequest, res: Response) => {
  const backupMeta = createBackup('manual_admin_export');

  addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: '💾 إنشاء نسخة احتياطية مشفرة',
    name: req.user?.name || 'المدير',
    email: req.user?.email || '-',
    company: 'FitBrilliance',
    role: 'مدير المنظومة',
    details: `تم توليد نسخة احتياطية جديدة برقم (${backupMeta.id}) بحجم ${backupMeta.sizeBytes} بايت.`
  });

  res.json({
    status: 'success',
    message: '✅ تم إنشاء وتوليد النسخة الاحتياطية المشفرة بنجاح.',
    backup: backupMeta
  });
});

// Restore database from backup ID (Admin Only)
router.post('/restore', authenticateJWT, requireAdmin, (req: AuthRequest, res: Response) => {
  const { backupId } = req.body;

  if (!backupId) {
    return res.status(400).json({ status: 'error', message: 'رقم النسخة الاحتياطية (backupId) مطلوب.' });
  }

  const success = restoreBackup(backupId);
  if (!success) {
    return res.status(400).json({
      status: 'error',
      message: '⛔ تعذر استعادة النسخة الاحتياطية. يرجى التأكد من الكود أو سلامة الملف.'
    });
  }

  addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: '🔄 استعادة نسخة احتياطية',
    name: req.user?.name || 'المدير',
    email: req.user?.email || '-',
    company: 'FitBrilliance',
    role: 'مدير المنظومة',
    details: `تم استعادة قاعدة البيانات الكاملة من النسخة الاحتياطية (${backupId}).`
  });

  res.json({
    status: 'success',
    message: '✅ تم استعادة البيانات والأنظمة بالكامل بنجاح.'
  });
});

export default router;
