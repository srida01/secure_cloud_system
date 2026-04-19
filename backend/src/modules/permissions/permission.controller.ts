import { Response } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { createAuditLog } from '../../middleware/auditLogger';

export const shareResource = async (req: AuthRequest, res: Response) => {
  const { granteeEmail, resourceId, resourceType, permissionLevel, expiresAt } = req.body;

  // Find grantee by Clerk email — you'd look up by email via Clerk
  // For simplicity, accept granteeUserId directly
  const { granteeUserId } = req.body;

  const perm = await prisma.permission.create({
    data: {
      grantedBy: req.userId!,
      granteeUserId,
      resourceId,
      resourceType,
      permissionLevel,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await createAuditLog(req.userId!, 'share', resourceId, resourceType, { granteeUserId, permissionLevel });
  res.status(201).json({ success: true, data: perm });
};

export const revokePermission = async (req: AuthRequest, res: Response) => {
  const perm = await prisma.permission.findUnique({ where: { id: req.params.id } });
  if (!perm || perm.grantedBy !== req.userId) throw new AppError(403, 'Access denied');

  await prisma.permission.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Permission revoked' });
};

export const getSharedWithMe = async (req: AuthRequest, res: Response) => {
  const perms = await prisma.permission.findMany({
    where: { granteeUserId: req.userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: perms });
};