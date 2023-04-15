import { createChildRouter } from '@utils/router';
import { USER_SCHEMA } from '@schemas/users';

import { requireSchemaValidator } from '@middleware/validateSchema';
import { usersController } from '@controllers/users';

const router = createChildRouter();

router.get('/token', usersController.getRefreshJwtToken);
router.post('/register', (req, res) => res.json('register'));
router.post(
    '/login',
    requireSchemaValidator(USER_SCHEMA.loginSchema),
    usersController.postLoginUser
);
router.get('/get', (req, res) => res.json('get'));
router.put('/edit', (req, res) => res.json('edit'));
router.post('/delete', (req, res) => res.json('delete'));

export const usersRouter = router;
