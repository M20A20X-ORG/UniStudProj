import { Router } from 'express';

import { authRouter } from './authRouter';
import { usersRouter } from './usersRouter';
import { projectsRouter } from './projects/projectsRouter';
import { testsRouter } from './tests/testsRouter';
import { newsRouter } from './/newsRouter';
import { resourcesRouter } from './/resourcesRouter';
import { metricsRouter } from './/metricsRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tests', testsRouter);
router.use('/news', newsRouter);
router.use('/resources', resourcesRouter);
router.use('/metrics', metricsRouter);

export const appRouter = router;
