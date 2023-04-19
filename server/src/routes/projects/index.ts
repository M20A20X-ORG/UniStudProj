import { tasksRouter } from './tasks';
import { projectsController } from '@controllers/projects';

import { ACCESS_ROLE } from '@configs/auth';
import { PROJECT_QUERY } from '@schemas/projects';

import { createChildRouter } from '@utils/router';
import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireAuth } from '@middleware/auth';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;

router.post(
    '/create',
    requireAuth(user, admin),
    requireSchemaValidator('http://example.com/schemas/project/create'),
    projectsController.postCreateProject
);
router.delete(
    '/delete',
    requireAuth(user, admin),
    PROJECT_QUERY.projectId,
    projectsController.deleteDeleteProject
);

router.use('/tasks', tasksRouter);

export const projectsRouter = router;
