import { createChildRouter } from '@utils/router';

import { ACCESS_ROLE } from '@configs/auth';

import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireAuth } from '@middleware/auth';

import { authController } from '@controllers/auth';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;

router.get('/token', requireAuth(admin, user), authController.getRefreshJwtToken);
router.post(
    '/login',
    requireSchemaValidator('http://example.com/schemas/auth/login'),
    authController.postLoginUser
);

export const authRouter = router;
