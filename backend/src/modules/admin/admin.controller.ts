import { Response } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { prisma } from '../../utils/prisma';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const { userId, action, from, to, page = '1', limit = '50' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(userId && { actorId: String(userId) }),
      ...(action && { action: action as any }),
      ...(from && { createdAt: { gte: new Date(String(from)) } }),
      ...(to && { createdAt: { lte: new Date(String(to)) } }),
    },
    include: { actor: { select: { id: true, clerkUserId: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    skip,
    take: Number(limit),
  });

  res.json({ success: true, data: logs });
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    include: { storageQuota: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: users });
};

export const updateUserQuota = async (req: AuthRequest, res: Response) => {
  const { quotaBytes } = req.body;
  const quota = await prisma.storageQuota.update({
    where: { userId: req.params.id },
    data: { quotaBytes: BigInt(quotaBytes) },
  });
  res.json({ success: true, data: quota });
};