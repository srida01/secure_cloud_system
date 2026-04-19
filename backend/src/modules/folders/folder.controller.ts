import { Response } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { createAuditLog } from '../../middleware/auditLogger';
import { v4 as uuidv4 } from 'uuid';

export const createFolder = async (req: AuthRequest, res: Response) => {
  const { name, parentFolderId } = req.body;
  if (!name) throw new AppError(400, 'Folder name is required');

  let depth = 0;
  let path = `/${name}`;

  if (parentFolderId) {
    const parent = await prisma.folder.findUnique({ where: { id: parentFolderId } });
    if (!parent) throw new AppError(404, 'Parent folder not found');
    depth = parent.depth + 1;
    path = `${parent.path}/${name}`;
  }

  const folder = await prisma.folder.create({
    data: {
      ownerId: req.userId!,
      parentFolderId: parentFolderId || null,
      name,
      path,
      depth,
    },
  });

  await createAuditLog(req.userId!, 'edit', folder.id, 'folder', { action: 'create', name });
  res.status(201).json({ success: true, data: folder });
};

export const getFolders = async (req: AuthRequest, res: Response) => {
  const { parentFolderId } = req.query;

  const folders = await prisma.folder.findMany({
    where: {
      ownerId: req.userId!,
      parentFolderId: parentFolderId ? String(parentFolderId) : null,
      isDeleted: false,
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: folders });
};

export const getFolder = async (req: AuthRequest, res: Response) => {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.isDeleted) throw new AppError(404, 'Folder not found');
  res.json({ success: true, data: folder });
};

export const renameFolder = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });

  if (!folder || folder.ownerId !== req.userId) throw new AppError(403, 'Access denied');

  const updated = await prisma.folder.update({
    where: { id: req.params.id },
    data: { name, updatedAt: new Date() },
  });

  await createAuditLog(req.userId!, 'edit', folder.id, 'folder', { action: 'rename', oldName: folder.name, newName: name });
  res.json({ success: true, data: updated });
};

export const deleteFolder = async (req: AuthRequest, res: Response) => {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.ownerId !== req.userId) throw new AppError(403, 'Access denied');

  await prisma.folder.update({ where: { id: req.params.id }, data: { isDeleted: true } });
  await createAuditLog(req.userId!, 'delete', folder.id, 'folder', { name: folder.name });
  res.json({ success: true, message: 'Folder deleted' });
};

export const getFolderAuditLogs = async (req: AuthRequest, res: Response) => {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.isDeleted) throw new AppError(404, 'Folder not found');
  
  if (folder.ownerId !== req.userId) {
    const perm = await prisma.permission.findFirst({
      where: { resourceId: folder.id, granteeUserId: req.userId, isActive: true },
    });
    if (!perm) throw new AppError(403, 'Access denied');
  }

  // Get all audit logs for the folder
  const folderLogs = await prisma.auditLog.findMany({
    where: { resourceId: folder.id, resourceType: 'folder' },
    include: { actor: { select: { clerkUserId: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Get all files in this folder (recursively)
  const getAllFiles = async (folderId: string): Promise<string[]> => {
    const files = await prisma.file.findMany({
      where: { folderId, isDeleted: false },
      select: { id: true },
    });
    
    const fileIds = files.map(f => f.id);
    
    const childFolders = await prisma.folder.findMany({
      where: { parentFolderId: folderId, isDeleted: false },
      select: { id: true },
    });
    
    for (const child of childFolders) {
      const childFileIds = await getAllFiles(child.id);
      fileIds.push(...childFileIds);
    }
    
    return fileIds;
  };

  const allFileIds = await getAllFiles(folder.id);

  // Get audit logs for all files in this folder hierarchy
  const fileLogs = await prisma.auditLog.findMany({
    where: {
      resourceId: { in: allFileIds },
      resourceType: 'file',
    },
    include: { actor: { select: { clerkUserId: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Combine and sort all logs
  const allLogs = [...folderLogs, ...fileLogs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({ success: true, data: allLogs });
};