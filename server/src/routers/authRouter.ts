import { createChildRouter } from '@utils/router';

import { ACCESS_ROLE } from '@configs/authConfig';

import { requireSchemaValidator } from '@middleware/requireSchemaValidator';
import { requireAuth } from '@middleware/requireAuth';

import { authController } from '@controllers/authController';

const router = createChildRouter();
const { user, admin } = ACCESS_ROLE;

router.get('/token', requireAuth([admin, user]), authController.getRefreshJwtToken);
router.post(
    '/login',
    requireSchemaValidator('http://example.com/schemas/auth/login'),
    authController.postLoginUser
);

export const authRouter = router;
