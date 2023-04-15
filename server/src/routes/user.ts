import { createChildRouter } from '@utils/router';

import { ACCESS_ROLE } from '@configs/auth';
import { USER_SCHEMA } from '@schemas/users';

import { requireAuth } from '@middleware/auth';
import { requireQueryValidator } from '@middleware/validateQuery';
import { requireSchemaValidator } from '@middleware/validateSchema';

import { usersController } from '@controllers/users';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;
const { registrationSchema, editSchema } = USER_SCHEMA;

router.post(
    '/register',
    requireSchemaValidator(registrationSchema),
    usersController.postRegisterUser
);
router.get('/get', requireQueryValidator('user'), usersController.getGetUser);
router.put(
    '/edit',
    requireAuth(admin, user),
    requireSchemaValidator(editSchema),
    usersController.putEditUser
);
router.delete(
    '/delete',
    requireAuth(admin, user),
    requireQueryValidator('userId'),
    usersController.deleteDeleteUser
);

export const usersRouter = router;
