import { ACCESS_ROLE, PROJECT_ACCESS_ROLE } from '@configs/authConfig';
import { PROJECT_QUERY } from '@schemas/projects';
import { TASK_QUERY } from '@schemas/projects/tasks';

import { createChildRouter } from '@utils/router';

import { requireSchemaValidator } from '@middleware/requireSchemaValidator';
import { requireQueryValidator } from '@middleware/requireQueryValidator';
import { requireAuth } from '@middleware/requireAuth';

import { tasksController } from '@controllers/tasksController';

const router = createChildRouter();
const { manager, developer, owner, mentor } = PROJECT_ACCESS_ROLE;
const { user, admin } = ACCESS_ROLE;
const { projectId } = PROJECT_QUERY;
const { taskId } = TASK_QUERY;

router.get(
    '/get/statuses',
    requireAuth([user, admin], [manager, developer, owner, mentor]),
    tasksController.getGetTaskStatuses
);
router.get(
    '/get/tags',
    requireAuth([user, admin], [manager, developer, owner, mentor]),
    tasksController.getGetTaskTags
);
router.get(
    '/get',
    ...requireQueryValidator(projectId),
    requireAuth([user, admin], [manager, developer, owner, mentor]),
    tasksController.getGetTask
);
router.post(
    '/create',
    requireSchemaValidator('http://example.com/schemas/project/task/create'),
    requireAuth([user, admin], [owner, manager, developer]),
    tasksController.postCreateTask
);
router.put(
    '/edit',
    requireSchemaValidator('http://example.com/schemas/project/task/edit'),
    requireAuth([user, admin], [owner, manager, developer]),
    tasksController.putEditTask
);
router.delete(
    '/delete',
    ...requireQueryValidator(projectId, taskId),
    requireAuth([user, admin], [owner, manager, developer]),
    tasksController.deleteDeleteTask
);

export const tasksRouter = router;
