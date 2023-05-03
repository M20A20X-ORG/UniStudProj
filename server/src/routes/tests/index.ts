import { questionsRouter } from './questions';

import { ACCESS_ROLE, PROJECT_ACCESS_ROLE } from '@configs/auth';
import { TEST_QUERY } from '@schemas/tests';

import { createChildRouter } from '@utils/router';
import { requireQueryValidator } from '@middleware/validateQuery';
import { requireSchemaValidator } from '@middleware/validateSchema';
import { requireAuth } from '@middleware/auth';

import { testsController } from '@controllers/test';

const router = createChildRouter();
const { admin, user } = ACCESS_ROLE;
const { mentor } = PROJECT_ACCESS_ROLE;
const { testIds, needCommonDataOnly } = TEST_QUERY;

///// CRUD /////
router.post(
    '/create',
    requireSchemaValidator('http://example.com/schemas/test/creation'),
    requireAuth([admin, user], [mentor]),
    testsController.postCreateTests
);
router.get(
    '/get',
    ...requireQueryValidator(testIds, needCommonDataOnly),
    requireAuth([admin, user]),
    testsController.getGetTests
);
router.put(
    '/edit',
    requireSchemaValidator('http://example.com/schemas/test/edit'),
    requireAuth([admin, user], [mentor]),
    testsController.putEditTests
);
router.delete(
    '/delete',
    ...requireQueryValidator(testIds),
    requireAuth([admin, user], [mentor]),
    testsController.deleteTests
);

///// Interaction /////
router.post(
    '/appoint',
    requireSchemaValidator('http://example.com/schemas/test/users-need-tests'), // eslint-disable-line
    requireAuth([admin, user], [mentor]),
    testsController.postAddTestsForUsers
);
router.put(
    '/start',
    requireSchemaValidator('http://example.com/schemas/test/user-need-test'),
    requireAuth([admin, user]),
    testsController.putStartTest
);
router.put(
    '/complete',
    requireSchemaValidator('http://example.com/schemas/test/test-completed'),
    requireAuth([admin, user]),
    testsController.putCompleteTest
);
router.get(
    '/results',
    requireSchemaValidator('http://example.com/schemas/test/users-need-tests'),
    requireAuth([admin, user]),
    testsController.getTestsResults
);
router.delete(
    '/cancel',
    requireSchemaValidator('http://example.com/schemas/test/users-need-tests'),
    requireAuth([admin, user], [mentor]),
    testsController.postDeleteTestsForUsers
);

router.use('/questions', questionsRouter);

export const testsRouter = router;
