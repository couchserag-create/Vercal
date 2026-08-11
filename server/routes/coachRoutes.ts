import express, { Response } from 'express';
import { getCoachInfo, saveCoachInfo, addAuditLog } from '../db.ts';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', (req, res) => {
  const info = getCoachInfo();
  res.json({ status: 'success', coachInfo: info });
});

router.put('/', authenticateJWT, requireAdmin, (req: AuthRequest, res: Response) => {
  const data = req.body;
  const updated = saveCoachInfo(data);

  addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: '📖 تحديث كتيب الكوتش سراج',
    name: req.user?.name || 'المدير',
    email: req.user?.email || '-',
    company: 'FitBrilliance',
    role: 'مدير المنظومة',
    details: 'تم تحديث البيانات الشخصية والمحطات الزمنية لدليل الكوتش.'
  });

  res.json({
    status: 'success',
    message: '✅ تم تحديث ونشر محتوى كتيب الكوتش بنجاح.',
    coachInfo: updated
  });
});

export default router;
