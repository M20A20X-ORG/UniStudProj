import { Router } from 'express';

import { authRouter } from './auth';
import { usersRouter } from './user';
import { projectsRouter } from './projects';
import { testsRouter } from './tests';
import { newsRouter } from '@routes/news';
import { resourceRouter } from '@routes/resource';
import { metricsRouter } from '@routes/metrics';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tests', testsRouter);
router.use('/news', newsRouter);
router.use('/resources', resourceRouter);
router.use('/metrics', metricsRouter);

export const appRouter = router;
