import { usersController } from '@controllers/users';

import { ACCESS_ROLE } from '@configs/auth';
import { USER_QUERY } from '@schemas/users';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/auth';
import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireQueryValidator } from '@middleware/validateQuery';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;

router.post(
    '/register',
    requireSchemaValidator('http://example.com/schemas/user/registration'),
    usersController.postRegisterUser
);
router.get('/get', ...requireQueryValidator(USER_QUERY.userId), usersController.getGetUser);
router.put(
    '/edit',
    requireAuth([admin, user]),
    requireSchemaValidator('http://example.com/schemas/user/edit'),
    usersController.putEditUser
);
router.delete(
    '/delete',
    ...requireQueryValidator(USER_QUERY.userId),
    requireAuth([admin, user]),
    usersController.deleteDeleteUser
);

export const usersRouter = router;
