import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import {
  createFolder, getFolders, renameFolder,
  deleteFolder, getFolder
} from './folder.controller';

export const folderRouter = Router();

folderRouter.use(authenticate);
folderRouter.post('/', createFolder);
folderRouter.get('/', getFolders);
folderRouter.get('/:id', getFolder);
folderRouter.patch('/:id', renameFolder);
folderRouter.delete('/:id', deleteFolder);