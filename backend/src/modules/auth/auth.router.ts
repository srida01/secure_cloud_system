import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { syncUser, getMe } from './auth.controller';

export const authRouter = Router();

authRouter.post('/sync', authenticate, syncUser);
authRouter.get('/me', authenticate, getMe);