import { Response } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { prisma } from '../../utils/prisma';

export const searchFiles = async (req: AuthRequest, res: Response) => {
  const { q, mimeType, minSize, maxSize, fromDate, toDate, tags } = req.query;

  const files = await prisma.file.findMany({
    where: {
      ownerId: req.userId!,
      isDeleted: false,
      ...(q && { name: { contains: String(q) } }),
      ...(mimeType && { mimeType: { contains: String(mimeType) } }),
      ...(minSize && { sizeBytes: { gte: BigInt(String(minSize)) } }),
      ...(maxSize && { sizeBytes: { lte: BigInt(String(maxSize)) } }),
      ...(fromDate && { createdAt: { gte: new Date(String(fromDate)) } }),
      ...(toDate && { createdAt: { lte: new Date(String(toDate)) } }),
    },
    include: { tags: true },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  const folders = await prisma.folder.findMany({
    where: {
      ownerId: req.userId!,
      isDeleted: false,
      ...(q && { name: { contains: String(q) } }),
    },
    take: 20,
  });

  res.json({ success: true, data: { files, folders } });
};