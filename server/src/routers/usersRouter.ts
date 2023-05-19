import { ACCESS_ROLE } from '@configs/authConfig';
import { COMMON_QUERY } from '@schemas/index';
import { USER_QUERY } from '@schemas/users';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/requireAuth';
import { requireSchemaValidator } from '@middleware/requireSchemaValidator';
import { requireQueryValidator } from '@middleware/requireQueryValidator';

import { usersController } from '@controllers/usersController';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;
const { userIdentifiers, userId } = USER_QUERY;
const { limit } = COMMON_QUERY;

router.post(
    '/register',
    requireSchemaValidator('http://example.com/schemas/user/registration'),
    usersController.postRegisterUser
);
router.get('/get', ...requireQueryValidator(userIdentifiers, limit), usersController.getGetUser);
router.put(
    '/edit',
    requireAuth([admin, user]),
    requireSchemaValidator('http://example.com/schemas/user/edit'),
    usersController.putEditUser
);
router.delete(
    '/delete',
    ...requireQueryValidator(userId),
    requireAuth([admin, user]),
    usersController.deleteDeleteUser
);

export const usersRouter = router;
