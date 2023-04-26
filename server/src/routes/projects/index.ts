import { tasksRouter } from './tasks';
import { projectsController } from '@controllers/projects';

import { ACCESS_ROLE } from '@configs/auth';
import { PROJECT_QUERY } from '@schemas/projects';

import { createChildRouter } from '@utils/router';

import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireAuth } from '@middleware/auth';
import { requireQueryValidator } from '@middleware/validateQuery';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;

router.get(
    '/get',
    ...requireQueryValidator(PROJECT_QUERY.projectIds),
    projectsController.getGetProject
);
router.post(
    '/create',
    requireAuth([user, admin]),
    requireSchemaValidator('http://example.com/schemas/project/create'),
    projectsController.postCreateProject
);
router.put(
    '/edit',
    requireAuth([user, admin]),
    requireSchemaValidator('http://example.com/schemas/project/edit'),
    projectsController.putEditProject
);
router.delete(
    '/delete',
    ...requireQueryValidator(PROJECT_QUERY.projectId),
    requireAuth([user, admin]),
    projectsController.deleteDeleteProject
);

router.use('/tasks', tasksRouter);

export const projectsRouter = router;
