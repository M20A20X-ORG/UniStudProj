import { Router } from 'express';

import { authRouter } from './authRouter';
import { usersRouter } from './usersRouter';
import { projectsRouter } from './projects/projectsRouter';
import { newsRouter } from './newsRouter';
import { resourcesRouter } from './resourcesRouter';
import { metricsRouter } from './metricsRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/news', newsRouter);
router.use('/resources', resourcesRouter);
router.use('/metrics', metricsRouter);

export const appRouter = router;
