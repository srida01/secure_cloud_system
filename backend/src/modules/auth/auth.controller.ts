import { Response } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { prisma } from '../../utils/prisma';
import { createAuditLog } from '../../middleware/auditLogger';

export const syncUser = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { storageQuota: true },
  });

  await prisma.user.update({
    where: { id: req.userId },
    data: { lastLoginAt: new Date() },
  });

  await createAuditLog(req.userId!, 'login', undefined, undefined, {}, 'success', req.ip);

  res.json({ success: true, data: user });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { storageQuota: true },
  });
  res.json({ success: true, data: user });
};