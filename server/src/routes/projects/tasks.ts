import { ACCESS_ROLE, PROJECT_ACCESS_ROLE } from '@configs/auth';
import { PROJECT_QUERY } from '@schemas/projects';
import { TASK_QUERY } from '@schemas/projects/tasks';

import { tasksController } from '@controllers/tasks';

import { createChildRouter } from '@utils/router';

import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireQueryValidator } from '@middleware/validateQuery';
import { requireAuth } from '@middleware/auth';

const router = createChildRouter();
const { manager, developer, owner, mentor } = PROJECT_ACCESS_ROLE;
const { user, admin } = ACCESS_ROLE;

router.get(
    '/get',
    ...requireQueryValidator(PROJECT_QUERY.projectId),
    requireAuth([user, admin], [manager, developer, owner, mentor]),
    tasksController.getGetTask
);
router.post(
    '/create',
    requireSchemaValidator('http://example.com/schemas/project/task/create'),
    requireAuth([user, admin], [manager, developer]),
    tasksController.postCreateTask
);
router.put(
    '/edit',
    requireSchemaValidator('http://example.com/schemas/project/task/edit'),
    requireAuth([user, admin], [manager, developer]),
    tasksController.putEditTask
);
router.delete(
    '/delete',
    ...requireQueryValidator(PROJECT_QUERY.projectId, TASK_QUERY.taskId),
    requireAuth([user, admin], [manager, developer]),
    tasksController.deleteDeleteTask
);

export const tasksRouter = router;
