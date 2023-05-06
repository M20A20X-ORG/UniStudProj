import { ACCESS_ROLE } from '@configs/auth';
import { USER_QUERY } from '@schemas/users';

import { createChildRouter } from '@utils/router';

import { requireAuth } from '@middleware/auth';
import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireQueryValidator } from '@middleware/validateQuery';

import { usersController } from '@controllers/users';

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
