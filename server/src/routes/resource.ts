import { ACCESS_ROLE } from '@configs/auth';

import { createChildRouter } from '@utils/router';
import { requireAuth } from '@middleware/auth';
import { requireFileUpload } from '@middleware/requireFileUpload';

import { resourceController } from '@controllers/resource';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;

router.post(
    '/create',
    requireAuth([admin, user]),
    requireFileUpload('array', 'file', ['png', 'jpg']),
    resourceController.postCreateResource
);

export const resourceRouter = router;
