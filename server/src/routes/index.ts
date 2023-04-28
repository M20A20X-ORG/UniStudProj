import { Router } from 'express';

import { authRouter } from './auth';
import { usersRouter } from './user';
import { projectsRouter } from './projects';
import { testsRouter } from './tests';
import { resourceRouter } from '@routes/resource';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tests', testsRouter);
router.use('/resources', resourceRouter);

export const appRouter = router;
