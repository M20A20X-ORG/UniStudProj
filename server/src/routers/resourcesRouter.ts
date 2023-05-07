import { ACCESS_ROLE } from '@configs/authConfig';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/requireAuth';
import { requireFileUpload } from '@middleware/requireFileUploadMiddleware';

import { resourceController } from '@controllers/resourceController';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;

router.post(
    '/create',
    requireAuth([admin, user]),
    requireFileUpload('array', 'file', ['png', 'jpg']),
    resourceController.postCreateResource
);

export const resourcesRouter = router;
