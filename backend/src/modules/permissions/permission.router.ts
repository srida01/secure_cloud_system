import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { shareResource, revokePermission, getSharedWithMe } from './permission.controller';

export const permissionRouter = Router();
permissionRouter.use(authenticate);
permissionRouter.post('/share', shareResource);
permissionRouter.delete('/:id', revokePermission);
permissionRouter.get('/shared-with-me', getSharedWithMe);