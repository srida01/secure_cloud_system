import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/authenticate';
import { getAuditLogs, getAllUsers, updateUserQuota } from './admin.controller';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/audit-logs', getAuditLogs);
adminRouter.get('/users', getAllUsers);
adminRouter.patch('/users/:id/quota', updateUserQuota);