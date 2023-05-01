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

///// Usage /////

router.use('/questions', questionsRouter);

export const testsRouter = router;
