import { createChildRouter } from '@utils/router';
import { AUTH_SCHEMA } from '@schemas/auth';

import { requireSchemaValidator } from '@middleware/validateSchema';
import { authController } from '@controllers/auth';

const router = createChildRouter();

router.get('/token', authController.getRefreshJwtToken);
router.post(
    '/login',
    requireSchemaValidator(AUTH_SCHEMA.loginSchema),
    authController.postLoginUser
);

export const authRouter = router;
