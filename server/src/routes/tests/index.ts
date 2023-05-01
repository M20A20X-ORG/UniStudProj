import { questionsRouter } from './questions';
import { createChildRouter } from '@utils/router';
import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireAuth } from '@middleware/auth';
import { ACCESS_ROLE, PROJECT_ACCESS_ROLE } from '@configs/auth';
import { testsController } from '@controllers/test';
import { requireQueryValidator } from '@middleware/validateQuery';
import { TEST_QUERY } from '@schemas/tests';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;
const { mentor } = PROJECT_ACCESS_ROLE;

router.post(
    '/create',
    requireSchemaValidator('http://example.com/schemas/test/creation'),
    requireAuth([admin, user]),
    testsController.postCreateTests
);
router.get('/get', (req, res) => res.json('create'));
router.put('/edit', (req, res) => res.json('edit'));
router.delete(
    '/delete',
    ...requireQueryValidator(TEST_QUERY.testIds),
    requireAuth([admin, user], [mentor]),
    testsController.deleteTests
);

router.use('/questions', questionsRouter);

export const testsRouter = router;
