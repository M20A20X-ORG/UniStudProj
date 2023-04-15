import { Router } from 'express';

import { authRouter } from './auth';
import { usersRouter } from './user';
import { projectsRouter } from './projects';
import { testsRouter } from './tests';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/test', testsRouter);

export const appRouter = router;
