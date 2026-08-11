import express, { Response } from 'express';
import { getAuditLogs, addAuditLog } from '../db.ts';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET audit logs (Admin Only)
router.get('/', authenticateJWT, requireAdmin, (req: AuthRequest, res: Response) => {
  const logs = getAuditLogs();
  res.json({ status: 'success', auditLogs: logs });
});

// POST record new log entry (Public or Client actions)
router.post('/', (req, res) => {
  const { eventType, name, email, company, role, details } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';

  const log = addAuditLog({
    timestamp: new Date().toLocaleString('ar-EG'),
    eventType: eventType || 'نشاط عام',
    name: name || 'زائر',
    email: email || '-',
    company: company || '-',
    role: role || 'زائر',
    details: details || '',
    ip: clientIp
  });

  res.json({ status: 'success', log });
});

export default router;
