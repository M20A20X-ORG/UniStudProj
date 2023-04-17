import { usersController } from '@controllers/users';

import { ACCESS_ROLE } from '@configs/auth';
import { USER_QUERY } from '@schemas/users';

import { createChildRouter } from '@utils/router';
import { requireAuth } from '@middleware/auth';
import { requireSchemaValidator } from '@middleware/validateSchema';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;

router.post(
    '/register',
    requireSchemaValidator('http://example.com/schemas/user/registration'),
    usersController.postRegisterUser
);
router.get('/get', USER_QUERY.userId, usersController.getGetUser);
router.put(
    '/edit',
    requireAuth(admin, user),
    requireSchemaValidator('http://example.com/schemas/user/edit'),
    usersController.putEditUser
);
router.delete(
    '/delete',
    requireAuth(admin, user),
    USER_QUERY.userId,
    usersController.deleteDeleteUser
);

export const usersRouter = router;
