import { ACCESS_ROLE } from '@configs/authConfig';
import { USER_QUERY } from '@schemas/users';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/requireAuth';
import { requireSchemaValidator } from '@middleware/requireSchemaValidator';
import { requireQueryValidator } from '@middleware/requireQueryValidator';

import { usersController } from '@controllers/usersController';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;
const { userIdentifiers } = USER_QUERY;

router.post(
    '/register',
    requireSchemaValidator('http://example.com/schemas/user/registration'),
    usersController.postRegisterUser
);
router.get('/get', ...requireQueryValidator(userIdentifiers), usersController.getGetUser);
router.put(
    '/edit',
    requireAuth([admin, user]),
    requireSchemaValidator('http://example.com/schemas/user/edit'),
    usersController.putEditUser
);
router.delete(
    '/delete',
    ...requireQueryValidator(userIdentifiers),
    requireAuth([admin, user]),
    usersController.deleteDeleteUser
);

export const usersRouter = router;
