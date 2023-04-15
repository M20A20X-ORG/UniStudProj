import { createChildRouter } from '@utils/router';
import { ACCESS_ROLE } from '@configs/auth';

import { requireAuth } from '@middleware/auth';
import { requireQueryValidator } from '@middleware/validateQuery';

import { usersController } from '@controllers/users';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;

router.post('/register', (req, res) => res.json('register'));
router.get('/get', requireQueryValidator('user'), usersController.getGetUser);
router.put('/edit', requireAuth(user), (req, res) => res.json('get'));
router.delete(
    '/delete',
    requireAuth(admin, user),
    requireQueryValidator('userId'),
    usersController.deleteDeleteUser
);

export const usersRouter = router;
