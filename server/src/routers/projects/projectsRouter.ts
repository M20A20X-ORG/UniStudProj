import { tasksRouter } from './tasksRouter';

import { ACCESS_ROLE } from '@configs/authConfig';
import { PROJECT_QUERY } from '@schemas/projects';

import { createChildRouter } from '@utils/router';

import { requireSchemaValidator } from '@middleware/requireSchemaValidator';
import { requireAuth } from '@middleware/requireAuth';
import { requireQueryValidator } from '@middleware/requireQueryValidator';

import { projectsController } from '@controllers/projectsController';
import { COMMON_QUERY } from '@schemas/index';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;
const { projectId, projectIds } = PROJECT_QUERY;
const { limit } = COMMON_QUERY;

router.get('/tags/get', ...requireQueryValidator(limit), projectsController.getGetTags);
router.get('/get', ...requireQueryValidator(projectIds, limit), projectsController.getGetProject);
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
    ...requireQueryValidator(projectId),
    requireAuth([user, admin]),
    projectsController.deleteDeleteProject
);

router.use('/tasks', tasksRouter);

export const projectsRouter = router;
