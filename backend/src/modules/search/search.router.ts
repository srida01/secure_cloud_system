import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { searchFiles } from './search.controller';

export const searchRouter = Router();
searchRouter.use(authenticate);
searchRouter.get('/', searchFiles);