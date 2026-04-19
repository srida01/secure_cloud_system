import { Response, NextFunction } from 'express';
import { AuthRequest } from '../src/middleware/authenticate';
import { prisma } from '../src/utils/prisma';
import { AuditAction, AuditStatus } from '@prisma/client';

export const createAuditLog = async (
  actorId: string,
  action: AuditAction,
  resourceId?: string,
  resourceType?: string,
  metadata?: object,
  status: AuditStatus = 'success',
  ipAddress?: string
) => {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      resourceId,
      resourceType,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      status,
      ipAddress,
    },
  });
};