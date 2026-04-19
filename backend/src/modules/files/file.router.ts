import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/authenticate';
import {
  uploadFile, getFiles, downloadFile,
  deleteFile, renameFile, getFileById
} from './file.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB

export const fileRouter = Router();

fileRouter.use(authenticate);
fileRouter.post('/upload', upload.single('file'), uploadFile);
fileRouter.get('/', getFiles);
fileRouter.get('/:id', getFileById);
fileRouter.get('/:id/download', downloadFile);
fileRouter.patch('/:id', renameFile);
fileRouter.delete('/:id', deleteFile);